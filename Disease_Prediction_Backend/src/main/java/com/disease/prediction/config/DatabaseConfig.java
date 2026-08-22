package com.disease.prediction.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/disease_prediction_db}")
    private String dbUrl;

    @Value("${spring.datasource.username:postgres}")
    private String dbUsername;

    @Value("${spring.datasource.password:postgres}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSourceProperties dataSourceProperties() {
        DataSourceProperties properties = new DataSourceProperties();
        properties.setDriverClassName("org.postgresql.Driver");
        properties.setUrl(dbUrl);
        properties.setUsername(dbUsername);
        properties.setPassword(dbPassword);

        System.out.println("DatabaseConfig: Initializing DataSourceProperties -> URL: " + dbUrl + ", Username: " + dbUsername);
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
        dataSource.setInitializationFailTimeout(0);

        try (java.sql.Connection conn = dataSource.getConnection()) {
            System.out.println("DatabaseConfig: SUCCESS - Connected to PostgreSQL database at " + properties.getUrl() + " as user " + properties.getUsername());
        } catch (Exception e) {
            System.err.println("DatabaseConfig: NOTICE - Initial connection check pending during startup for " + properties.getUrl() + ": " + e.getMessage());
        }

        return dataSource;
    }
}

