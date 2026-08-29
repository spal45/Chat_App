import amqp from 'amqplib'

let channel: amqp.Channel;

export const connectRabbitMQ = async ()=> {
    try{
        const hostname = process.env.Rabbitmq_Host;
        const username = process.env.Rabbitmq_Username;
        const password = process.env.Rabbitmq_Password;

        if (!hostname || !username || !password) {
            throw new Error('Missing RabbitMQ configuration');
        }

        const connection = await amqp.connect({
            protocol: "amqp",
            hostname,
            port: 5672,
            username,
            password
        })

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