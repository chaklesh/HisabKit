# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN mkdir uploads

EXPOSE 8010

# Default environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8010

ENTRYPOINT ["java", "-jar", "app.jar"]
