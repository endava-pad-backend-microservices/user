import amqp = require("amqplib/callback_api");

export class RabbitMq{
    constructor(queue,message){
        amqp.connect(process.env.RABBIT_URL, function(error0,connection){
            if(error0){
                throw error0;
            }
            connection.createChannel(function(error1,channel){
                if(error1){
                    throw error1;
                }
                channel.sendToQueue(queue,Buffer.from(message));
                console.log("Sent %s to Rabbit",message);
            })
        });
    }
}