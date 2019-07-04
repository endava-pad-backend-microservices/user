import amqp = require("amqplib/callback_api");
import { Connection } from "typeorm";

export class RabbitMq {
    constructor(queue: string, message: string) {
        amqp.connect(process.env.RABBIT_URL, (error0, connection: any) => {
            if (error0) {
                throw error0;
            }
            connection.createChannel((error1, channel: any) => {
                if (error1) {
                    throw error1;
                }
                channel.sendToQueue(queue, Buffer.from(message));
                console.log("Sent %s to Rabbit", message);
            })
        });
    }
}
