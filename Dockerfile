# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build Spring Boot jar with frontend embedded ─────────────────────
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /backend
COPY backend/PokerJokerJava/ ./
# Embed the Vite build as Spring Boot static resources
COPY --from=frontend-build /frontend/dist src/main/resources/static/
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon -x test

# ── Stage 3: Minimal runtime image ───────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /backend/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
