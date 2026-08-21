package com.disease.prediction.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class DatabaseConfig {

    @Value("${SPRING_DATASOURCE_URL:${DATABASE_URL:${Database_url:${Database_Url:${INTERNAL_DATABASE_URL:}}}}}")
    private String rawUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:${DB_USERNAME:${Database_username:${Database_user:postgres}}}}")
    private String defaultUsername;

    @Value("${SPRING_DATASOURCE_PASSWORD:${DB_PASSWORD:${Database_password:${Database_pass:postgres}}}}")
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
            if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
                try {
                    String tempUrl = dbUrl.replaceFirst("^postgres(ql)?://", "http://");
                    URI uri = new URI(tempUrl);

                    String host = uri.getHost();
                    int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                    String path = uri.getPath() != null ? uri.getPath() : "";
                    String query = uri.getQuery();

                    if (uri.getUserInfo() != null && uri.getUserInfo().contains(":")) {
                        String[] userInfo = uri.getUserInfo().split(":", 2);
                        try {
                            username = URLDecoder.decode(userInfo[0], StandardCharsets.UTF_8);
                        } catch (Exception ignored) {
                            username = userInfo[0];
                        }
                        try {
                            password = URLDecoder.decode(userInfo[1], StandardCharsets.UTF_8);
                        } catch (Exception ignored) {
                            password = userInfo[1];
                        }
                    }

                    if (query == null || query.isEmpty()) {
                        if (host != null && !host.equals("localhost") && !host.equals("127.0.0.1")) {
                            query = "sslmode=require";
                        } else {
                            query = "";
                        }
                    } else if (!query.contains("sslmode")) {
                        query = query + "&sslmode=require";
                    }

                    String queryString = query.isEmpty() ? "" : "?" + query;
                    dbUrl = "jdbc:postgresql://" + host + ":" + port + path + queryString;
                    System.out.println("DatabaseConfig: Connecting to host=" + host + ", db=" + path + ", user=" + username);
                } catch (Exception e) {
                    System.err.println("DatabaseConfig: Error parsing database URI: " + e.getMessage());
                    if (!dbUrl.startsWith("jdbc:")) {
                        dbUrl = "jdbc:" + dbUrl;
                    }
                }
            } else if (!dbUrl.startsWith("jdbc:")) {
                dbUrl = "jdbc:" + dbUrl;
            }
        } else {
            dbUrl = "jdbc:postgresql://localhost:5432/disease_prediction_db";
            System.out.println("DatabaseConfig: Falling back to local PostgreSQL connection.");
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

        return dataSource;
    }
}
