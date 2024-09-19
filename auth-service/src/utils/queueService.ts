import amqplib from "amqplib";
import configs from "../configs";
export const pushToQueue = async (queueName: string, message: Record<string, any>) => {
  try{
      const conn = await amqplib.connect(configs.rabbitmq_host);
      const channel = await conn.createChannel();
      await channel.assertQueue(queueName, {durable: true});

      const messageStr = JSON.stringify(message);
      channel.sendToQueue(queueName, Buffer.from(messageStr, "utf8"));

      console.info(`Sent to ${queueName} - ${messageStr}`);

      await channel.close();
      await conn.close();
  }catch (e) {
      console.error("Failed to send to the queue"+e);
  }
}