package com.disease.prediction.config;

import org.slf.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(Environment env) {
        String rawUrl = env.getProperty("SPRING_DATASOURCE_URL");

        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            rawUrl = env.getProperty("DATABASE_URL");
        }
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            rawUrl = env.getProperty("INTERNAL_DATABASE_URL");
        }

        String jdbcUrl;
        String username = env.getProperty("SPRING_DATASOURCE_USERNAME");
        if (username == null || username.trim().isEmpty()) {
            username = env.getProperty("DB_USERNAME", "postgres");
        }

        String password = env.getProperty("SPRING_DATASOURCE_PASSWORD");
        if (password == null || password.trim().isEmpty()) {
            password = env.getProperty("DB_PASSWORD", "postgres");
        }

        if (rawUrl != null && !rawUrl.trim().isEmpty()) {
            rawUrl = rawUrl.trim();
            // Handle postgres:// or postgresql:// formats (commonly provided by Render / Heroku / Railway)
            if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
                try {
                    String tempUrl = rawUrl.replaceFirst("^postgres(ql)?://", "http://");
                    URI uri = new URI(tempUrl);
                    
                    String host = uri.getHost();
                    int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                    String path = uri.getPath() != null ? uri.getPath() : "";
                    String query = (uri.getQuery() != null && !uri.getQuery().isEmpty()) ? "?" + uri.getQuery() : "";

                    if (uri.getUserInfo() != null && uri.getUserInfo().contains(":")) {
                        String[] userInfo = uri.getUserInfo().split(":", 2);
                        username = userInfo[0];
                        password = userInfo[1];
                    }

                    jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + query;
                    logger.info("Parsed PostgreSQL URI into JDBC URL: {}", jdbcUrl);
                } catch (Exception e) {
                    logger.warn("Failed to parse database URI, falling back to raw URL: {}", e.getMessage());
                    if (!rawUrl.startsWith("jdbc:")) {
                        jdbcUrl = "jdbc:" + rawUrl;
                    } else {
                        jdbcUrl = rawUrl;
                    }
                }
            } else if (!rawUrl.startsWith("jdbc:")) {
                jdbcUrl = "jdbc:" + rawUrl;
            } else {
                jdbcUrl = rawUrl;
            }
        } else {
            // Default fallback for local development
            jdbcUrl = "jdbc:postgresql://localhost:5432/disease_prediction_db";
            logger.info("Using default local PostgreSQL connection: {}", jdbcUrl);
        }

        return DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(jdbcUrl)
                .username(username)
                .password(password)
                .build();
    }
}
