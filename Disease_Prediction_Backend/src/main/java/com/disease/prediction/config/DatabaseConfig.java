package com.disease.prediction.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class DatabaseConfig {

    @Value("${SPRING_DATASOURCE_URL:${DATABASE_URL:${Database_url:${Database_Url:${INTERNAL_DATABASE_URL:${DATABASE_PRIVATE_URL:${DATABASE_PUBLIC_URL:${POSTGRES_URL:${POSTGRESQL_URL:${JDBC_DATABASE_URL:}}}}}}}}}}")
    private String rawUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:${DB_USERNAME:${Database_username:${Database_user:${POSTGRES_USER:${POSTGRES_USERNAME:postgres}}}}}}")
    private String defaultUsername;

    @Value("${SPRING_DATASOURCE_PASSWORD:${DB_PASSWORD:${Database_password:${Database_pass:${POSTGRES_PASSWORD:postgres}}}}}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSourceProperties dataSourceProperties() {
        DataSourceProperties properties = new DataSourceProperties();
        properties.setDriverClassName("org.postgresql.Driver");

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
                    System.out.println("DatabaseConfig: Parsed PostgreSQL connection -> Host: " + host + ":" + port + ", Path: " + path + ", User: " + username);
                } catch (Exception e) {
                    System.err.println("DatabaseConfig: Warning while parsing database URI, falling back to raw JDBC string: " + e.getMessage());
                    if (!dbUrl.startsWith("jdbc:")) {
                        dbUrl = "jdbc:" + dbUrl;
                    }
                }
            } else if (!dbUrl.startsWith("jdbc:")) {
                dbUrl = "jdbc:" + dbUrl;
            }
        } else {
            dbUrl = "jdbc:postgresql://localhost:5432/disease_prediction_db";
            System.out.println("DatabaseConfig: No external DATABASE_URL found. Falling back to local PostgreSQL connection.");
        }

        properties.setUrl(dbUrl);
        properties.setUsername(username);
        properties.setPassword(password);

        return properties;
    }

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        HikariDataSource dataSource = properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();

        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(1);
        dataSource.setIdleTimeout(30000);
        dataSource.setMaxLifetime(600000);
        dataSource.setConnectionTimeout(20000);

        try (java.sql.Connection conn = dataSource.getConnection()) {
            System.out.println("DatabaseConfig: SUCCESS - Connected to PostgreSQL database at " + properties.getUrl() + " as user " + properties.getUsername());
        } catch (Exception e) {
            System.err.println("DatabaseConfig: ERROR - Failed to connect to PostgreSQL at " + properties.getUrl() + " as user " + properties.getUsername());
            System.err.println("DatabaseConfig: Failure Exception: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
        }

        return dataSource;
    }
}
