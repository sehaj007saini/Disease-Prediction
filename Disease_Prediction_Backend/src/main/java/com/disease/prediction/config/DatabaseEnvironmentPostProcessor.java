package com.disease.prediction.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class DatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String[] DB_URL_ENV_KEYS = {
            "SPRING_DATASOURCE_URL",
            "DATABASE_URL",
            "Database_url",
            "Database_Url",
            "INTERNAL_DATABASE_URL",
            "DATABASE_PRIVATE_URL",
            "DATABASE_PUBLIC_URL",
            "POSTGRES_URL",
            "POSTGRESQL_URL",
            "JDBC_DATABASE_URL"
    };

    private static final String[] DB_USER_ENV_KEYS = {
            "SPRING_DATASOURCE_USERNAME",
            "DB_USERNAME",
            "Database_username",
            "Database_user",
            "POSTGRES_USER",
            "POSTGRES_USERNAME"
    };

    private static final String[] DB_PASS_ENV_KEYS = {
            "SPRING_DATASOURCE_PASSWORD",
            "DB_PASSWORD",
            "Database_password",
            "Database_pass",
            "POSTGRES_PASSWORD"
    };

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String rawUrl = null;
        for (String key : DB_URL_ENV_KEYS) {
            String val = System.getenv(key);
            if (val == null || val.trim().isEmpty()) {
                val = environment.getProperty(key);
            }
            if (val != null && !val.trim().isEmpty()) {
                rawUrl = val.trim();
                System.out.println("DatabaseEnvironmentPostProcessor: Discovered database URL from key: " + key);
                break;
            }
        }

        String defaultUsername = null;
        for (String key : DB_USER_ENV_KEYS) {
            String val = System.getenv(key);
            if (val == null || val.trim().isEmpty()) {
                val = environment.getProperty(key);
            }
            if (val != null && !val.trim().isEmpty()) {
                defaultUsername = val.trim();
                break;
            }
        }
        if (defaultUsername == null || defaultUsername.isEmpty()) {
            defaultUsername = "postgres";
        }

        String defaultPassword = null;
        for (String key : DB_PASS_ENV_KEYS) {
            String val = System.getenv(key);
            if (val == null || val.trim().isEmpty()) {
                val = environment.getProperty(key);
            }
            if (val != null && !val.trim().isEmpty()) {
                defaultPassword = val.trim();
                break;
            }
        }
        if (defaultPassword == null || defaultPassword.isEmpty()) {
            defaultPassword = "postgres";
        }

        String dbUrl = rawUrl;
        String username = defaultUsername;
        String password = defaultPassword;

        if (dbUrl != null && !dbUrl.trim().isEmpty()) {
            dbUrl = dbUrl.trim();
            String urlToParse = dbUrl.startsWith("jdbc:") ? dbUrl.substring(5) : dbUrl;

            if (urlToParse.startsWith("postgres://") || urlToParse.startsWith("postgresql://")) {
                try {
                    String stringToParse = urlToParse.replaceFirst("^postgres(ql)?://", "");

                    int pathOrQueryStart = -1;
                    for (int i = 0; i < stringToParse.length(); i++) {
                        char c = stringToParse.charAt(i);
                        if (c == '/' || c == '?') {
                            pathOrQueryStart = i;
                            break;
                        }
                    }

                    String authority;
                    String pathAndQuery;
                    if (pathOrQueryStart != -1) {
                        authority = stringToParse.substring(0, pathOrQueryStart);
                        pathAndQuery = stringToParse.substring(pathOrQueryStart);
                    } else {
                        authority = stringToParse;
                        pathAndQuery = "";
                    }

                    int lastAt = authority.lastIndexOf('@');
                    String hostAndPort;
                    if (lastAt != -1) {
                        String userInfo = authority.substring(0, lastAt);
                        hostAndPort = authority.substring(lastAt + 1);

                        int firstColon = userInfo.indexOf(':');
                        if (firstColon != -1) {
                            String rawUser = userInfo.substring(0, firstColon);
                            String rawPass = userInfo.substring(firstColon + 1);
                            try {
                                username = URLDecoder.decode(rawUser, StandardCharsets.UTF_8);
                            } catch (Exception ignored) {
                                username = rawUser;
                            }
                            try {
                                password = URLDecoder.decode(rawPass, StandardCharsets.UTF_8);
                            } catch (Exception ignored) {
                                password = rawPass;
                            }
                        } else {
                            try {
                                username = URLDecoder.decode(userInfo, StandardCharsets.UTF_8);
                            } catch (Exception ignored) {
                                username = userInfo;
                            }
                        }
                    } else {
                        hostAndPort = authority;
                    }

                    String host;
                    int port = 5432;
                    int colonIdx = hostAndPort.indexOf(':');
                    if (colonIdx != -1) {
                        host = hostAndPort.substring(0, colonIdx);
                        try {
                            port = Integer.parseInt(hostAndPort.substring(colonIdx + 1));
                        } catch (Exception ignored) {}
                    } else {
                        host = hostAndPort;
                    }

                    String path = "";
                    String query = "";
                    if (pathAndQuery.startsWith("/")) {
                        int qIdx = pathAndQuery.indexOf('?');
                        if (qIdx != -1) {
                            path = pathAndQuery.substring(0, qIdx);
                            query = pathAndQuery.substring(qIdx + 1);
                        } else {
                            path = pathAndQuery;
                        }
                    } else if (pathAndQuery.startsWith("?")) {
                        query = pathAndQuery.substring(1);
                    }

                    if (query == null || !query.contains("sslmode")) {
                        if (host.contains(".render.com") || host.contains(".neon.tech") || host.contains(".supabase.")
                                || host.contains(".aws.") || host.contains(".azure.") || host.contains(".gcp.")) {
                            query = (query == null || query.isEmpty()) ? "sslmode=require" : query + "&sslmode=require";
                        } else if (!host.equals("localhost") && !host.equals("127.0.0.1") && !host.equals("db") && !host.equals("disease-db")) {
                            query = (query == null || query.isEmpty()) ? "sslmode=prefer" : query + "&sslmode=prefer";
                        }
                    }

                    String queryString = (query != null && !query.trim().isEmpty()) ? "?" + query.trim() : "";
                    dbUrl = "jdbc:postgresql://" + host + ":" + port + path + queryString;
                    System.out.println("DatabaseEnvironmentPostProcessor: Transformed PostgreSQL JDBC URL -> Host: " + host + ":" + port + ", Path: " + path + ", User: " + username);
                } catch (Exception e) {
                    System.err.println("DatabaseEnvironmentPostProcessor: Error parsing raw URL, using fallback: " + e.getMessage());
                    if (!dbUrl.startsWith("jdbc:")) {
                        dbUrl = "jdbc:" + dbUrl;
                    }
                }
            } else if (!dbUrl.startsWith("jdbc:")) {
                dbUrl = "jdbc:" + dbUrl;
            }
        } else {
            dbUrl = "jdbc:postgresql://localhost:5432/disease_prediction_db";
            System.out.println("DatabaseEnvironmentPostProcessor: Defaulting to local PostgreSQL URL: " + dbUrl);
        }

        Map<String, Object> props = new HashMap<>();
        props.put("spring.datasource.url", dbUrl);
        props.put("spring.datasource.username", username);
        props.put("spring.datasource.password", password);
        props.put("jakarta.persistence.jdbc.url", dbUrl);
        props.put("spring.jpa.database-platform", "org.hibernate.dialect.PostgreSQLDialect");
        props.put("spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");

        environment.getPropertySources().addFirst(new MapPropertySource("renderDatabasePostProcessorProperties", props));

        System.setProperty("spring.datasource.url", dbUrl);
        System.setProperty("spring.datasource.username", username);
        System.setProperty("spring.datasource.password", password);
        System.setProperty("jakarta.persistence.jdbc.url", dbUrl);
        System.setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        System.setProperty("spring.jpa.database-platform", "org.hibernate.dialect.PostgreSQLDialect");
    }
}
