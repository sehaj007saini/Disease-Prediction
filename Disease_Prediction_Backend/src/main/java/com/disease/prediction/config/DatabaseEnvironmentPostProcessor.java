package com.disease.prediction.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

public class DatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String rawUrl = environment.getProperty("SPRING_DATASOURCE_URL");
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            rawUrl = environment.getProperty("DATABASE_URL");
        }
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            rawUrl = environment.getProperty("INTERNAL_DATABASE_URL");
        }

        if (rawUrl != null && !rawUrl.trim().isEmpty()) {
            rawUrl = rawUrl.trim();
            Map<String, Object> map = new HashMap<>();

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
                        map.put("spring.datasource.username", userInfo[0]);
                        map.put("spring.datasource.password", userInfo[1]);
                    }

                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + query;
                    map.put("spring.datasource.url", jdbcUrl);
                    System.out.println("DatabaseEnvironmentPostProcessor: Converted PostgreSQL URI to JDBC URL: " + jdbcUrl);
                } catch (Exception e) {
                    System.err.println("DatabaseEnvironmentPostProcessor: Error parsing database URI: " + e.getMessage());
                    if (!rawUrl.startsWith("jdbc:")) {
                        map.put("spring.datasource.url", "jdbc:" + rawUrl);
                    } else {
                        map.put("spring.datasource.url", rawUrl);
                    }
                }
            } else {
                if (!rawUrl.startsWith("jdbc:")) {
                    map.put("spring.datasource.url", "jdbc:" + rawUrl);
                } else {
                    map.put("spring.datasource.url", rawUrl);
                }
            }

            if (!map.isEmpty()) {
                environment.getPropertySources().addFirst(new MapPropertySource("renderDatabaseProperties", map));
            }
        }
    }
}
