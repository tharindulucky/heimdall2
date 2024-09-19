import "reflect-metadata";
import {DataSource} from "typeorm";

import {Log} from "./entities/Log";
import configs from "./configs";

const AppDataSource = new DataSource({
    type: "mysql",
    host: configs.db.host,
    port: configs.db.port,
    username: configs.db.username,
    password: configs.db.password,
    database: configs.db.name,
    entities: [__dirname + "/entities/*.{ts,js}"],
    synchronize: true,
    logging: false
});

export default AppDataSource;