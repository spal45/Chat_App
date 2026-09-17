import amqp from 'amqplib'

let channel: amqp.Channel;

export const connectRabbitMQ = async ()=> {
    try{
        // RABBITMQ_URL (a full amqp:// or amqps:// connection string, as
        // managed providers like CloudAMQP give you) takes priority. Falls
        // back to discrete host/user/password for local dev and the
        // docker-compose stack, where the port is always plain amqp:5672.
        const url = process.env.RABBITMQ_URL;
        const hostname = process.env.Rabbitmq_Host;
        const username = process.env.Rabbitmq_Username;
        const password = process.env.Rabbitmq_Password;

        let connection;
        if (url) {
            connection = await amqp.connect(url);
        } else if (hostname && username && password) {
            connection = await amqp.connect({
                protocol: "amqp",
                hostname,
                port: 5672,
                username,
                password
            });
        } else {
            throw new Error('Missing RabbitMQ configuration');
        }

        channel = await connection.createChannel();
        console.log("✅ Connected to rabbitmq");

    }catch(error){
        console.log('Failed to connect to rabbitmq', error)
    }
}

export const publishToQueue = async (queueName:string, message: any) =>{
    if(!channel) {
        console.log("Rabbitmq channel is not initalizes");
        return;
    }

    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true
    })
}