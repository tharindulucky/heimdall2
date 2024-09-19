import dotenv from "dotenv";

dotenv.config();

const configs = {
    app_name: process.env["APP_NAME"] ?? "notification-service",
    environment: process.env["ENV"] ?? "local",
    port: process.env["PORT"] ?? "3000",
    host: process.env["HOST"] ?? "http://localhost:3000",
    rabbitmq_host: process.env["RABBITMQ_HOST"] ?? "",
    logger_host: process.env["LOGGER_HOST"] ?? "localhost:50051",
    emailService:{
        host: process.env["EMAIL_HOST"] ?? "",
        port: process.env["EMAIL_PORT"] ?? "",
        user: process.env["EMAIL_AUTH_USER"] ?? "",
        pass: process.env["EMAIL_AUTH_PASS"] ?? "",
        senderAddr: process.env["EMAIL_SENDER_ADDR"] ?? "",
    }
}

export default configs;