package com.disease.prediction.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${SPRING_DATASOURCE_URL:${DATABASE_URL:${INTERNAL_DATABASE_URL:}}}")
    private String rawUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:${DB_USERNAME:postgres}}")
    private String defaultUsername;

    @Value("${SPRING_DATASOURCE_PASSWORD:${DB_PASSWORD:postgres}}")
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
                    String query = (uri.getQuery() != null && !uri.getQuery().isEmpty()) ? "?" + uri.getQuery() : "";

                    if (uri.getUserInfo() != null && uri.getUserInfo().contains(":")) {
                        String[] userInfo = uri.getUserInfo().split(":", 2);
                        username = userInfo[0];
                        password = userInfo[1];
                    }

                    dbUrl = "jdbc:postgresql://" + host + ":" + port + path + query;
                } catch (Exception e) {
                    if (!dbUrl.startsWith("jdbc:")) {
                        dbUrl = "jdbc:" + dbUrl;
                    }
                }
            } else if (!dbUrl.startsWith("jdbc:")) {
                dbUrl = "jdbc:" + dbUrl;
            }
        } else {
            dbUrl = "jdbc:postgresql://localhost:5432/disease_prediction_db";
        }

        properties.setUrl(dbUrl);
        properties.setUsername(username);
        properties.setPassword(password);

        return properties;
    }

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }
}
