# Stage 1: Build stage with Maven
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy Maven POM and dependency definition
COPY pom.xml .

# Copy source code and package application JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy compiled JAR from build stage
COPY --from=build /app/target/app.jar app.jar

EXPOSE 8080

# Configure JVM memory for Render 512MB RAM containers and start application
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-XX:InitialRAMPercentage=50.0", "-Xss256k", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

