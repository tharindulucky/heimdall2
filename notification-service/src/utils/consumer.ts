import amqplib from "amqplib";
import configs from "../configs";
import {composeEmail} from "../controllers/notificationController";
import {writeLog} from "./logger";
export const emailServiceConsumer = async () => {
    try{
        console.info('Email consumer running..');
        writeLog('INFO', 'Email consumer running!');

        const queueName = 'EmailQueue';

        const conn = await amqplib.connect(configs.rabbitmq_host);
        const channel = await conn.createChannel();
        await channel.assertQueue(queueName, {durable: true});

        await channel.consume(queueName, async (message) => {
            if(message){
                const messageObj = JSON.parse(message.content.toString());

                try {
                    await composeEmail(messageObj);
                    channel.ack(message);
                } catch (e) {
                    console.error('Failed to compose the email'+e);
                    writeLog('ERROR', 'Failed to compose the email', JSON.stringify(e));
                }
            }
        });

    }catch (e) {
        console.error('Failed to consume the message'+e);
        writeLog('ERROR', 'Failed to consume the message', JSON.stringify(e));
    }
}