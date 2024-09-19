import dotenv from "dotenv";

dotenv.config();

const configs = {
    app_name: process.env["APP_NAME"] ?? "auth-service",
    environment: process.env["ENV"] ?? "local",
    port: process.env["PORT"] ?? "3000",
    host: process.env["HOST"] ?? "http://localhost:3000",
    db: {
        uri: process.env["DB_URI"] ?? ""
    },
    jwt_secret: process.env['JWT_SECRET'] ?? "",
    rabbitmq_host: process.env["RABBITMQ_HOST"] ?? "",
    logger_host: process.env["LOGGER_HOST"] ?? "localhost:50051",
    default_user: {
        email: process.env["DEFAULT_USER_EMAIL"] ?? null,
        password: process.env["DEFAULT_USER_PASSWORD"] ?? ""
    }
}

export default configs;