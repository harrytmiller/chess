FROM openjdk:17-jdk-slim

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN apt-get update && apt-get install -y maven
RUN mvn clean package -DskipTests

EXPOSE 8080

# Fixed to use the correct JAR name
CMD ["java", "-jar", "target/chess-backend-0.0.1-SNAPSHOT.jar"]