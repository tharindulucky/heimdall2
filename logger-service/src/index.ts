import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import configs from "./configs";
import {Log} from "./entities/Log";
import dataSource from "./data-source";
import DataSource from "./data-source";

const PROTO_PATH = './data/logging.proto';

dataSource.initialize().then(() => {
  console.info("DB connection successful!");
}).catch((error) => {
  console.error("DB connection failed!");
  console.error(error);
})

interface LogRequest {
  source: string;
  level: string;
  message: string;
  data: any;
  timestamp: string;
}

interface LogResponse {
  success: boolean;
}

interface LoggingServiceHandlers extends grpc.UntypedServiceImplementation {
  logEvent: grpc.handleUnaryCall<LogRequest, LogResponse>;
}

// Load the protobuf definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const loggingProto = grpc.loadPackageDefinition(packageDefinition).logging as any;

// Implement the gRPC service
const logEvent: grpc.handleUnaryCall<LogRequest, LogResponse> = (
    call: ServerUnaryCall<LogRequest, LogResponse>,
    callback: sendUnaryData<LogResponse>
) => {
  try {
    const { source, level, message, data, timestamp } = call.request;
    console.log(`[${timestamp}] ${source} ${level}: ${message} - ${data}`);

    const logRepository = DataSource.getRepository(Log);

    logRepository.insert({
      source: source,
      type: level,
      description: message,
      data: data,
    }).then(log => {
      console.log('Record inserted successfully!');
    }).catch((err: Error) => {
      console.error(err);
    });

    callback(null, { success: true });
  }catch (e) {
    console.log(e);
  }
};

// Create and start the gRPC server
const startGrpcServer = () => {
  const server = new grpc.Server();
  const loggingService: LoggingServiceHandlers = { logEvent };
  server.addService(loggingProto.LoggingService.service, loggingService);
  server.bindAsync(`${configs.bind_addr}:${configs.port}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Logger gRPC server running at http://${configs.bind_addr}:${configs.port}`);
  });
};

startGrpcServer();
