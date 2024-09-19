import dotenv from "dotenv";

dotenv.config();

const configs = {
    environment: process.env["ENV"] ?? "local",
    port: process.env["PORT"] ?? "50051",
    bind_addr: process.env["BIND_ADDR"] ?? "0.0.0.0",
    db: {
        host: process.env["DB_HOST"] ?? "",
        port: Number(process.env["DB_PORT"]) ?? 3307,
        username: process.env["DB_USERNAME"] ?? "",
        password: process.env["DB_PASSWORD"] ?? "",
        name: process.env["DB_NAME"] ?? ""
    },
    jwt_secret: process.env['JWT_SECRET'] ?? "",

}

export default configs;