import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import configs from "../configs";

const PROTO_PATH = './data/logging.proto';

// Load the protobuf definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const loggingProto = grpc.loadPackageDefinition(packageDefinition).logging as any;

export const writeLog = (level: string, desc: string, additionalData?: any) => {
    const client = new loggingProto.LoggingService(
        configs.logger_host,
        grpc.credentials.createInsecure()
    );

    client.logEvent(
        {
            source: configs.app_name,
            level: level,
            message: desc,
            data: additionalData || null,
            timestamp: new Date().toISOString(),
        },
        (error: grpc.ServiceError | null, response: { success: boolean }) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Logged: ', response.success);
            }
        }
    );
};
