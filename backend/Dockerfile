FROM maven:3.9-amazoncorretto-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM amazoncorretto:17-alpine
WORKDIR /app
COPY --from=build /app/target/F1Track-1.0-SNAPSHOT.jar app.jar
COPY f1db.db f1db.db
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]