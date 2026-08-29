import amqp from 'amqplib'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()


export const startSendOtpConsumer = async()=>{
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

        const channel = await connection.createChannel()
        const queueName = "send-otp"
        await channel.assertQueue(queueName,{ durable:true })

        console.log("✅ Mail Service Consumer started, listening for otp emails")

        channel.consume(queueName, async (msg)=>{
            try{
                if (!msg) return;
                const {to, subject, body } = JSON.parse(msg.content.toString())

                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    auth: {
                            user: process.env.SMTP_USER,
                            pass: process.env.SMTP_PASSWORD
                    }
                });

                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to,
                    subject,
                    text: body,
                });

                console.log(`OTP mail send to ${to}`);
                channel.ack(msg);
            }catch(error){
                console.log("Failed to send otp", error)
            }
        })
    }catch(error){
        console.log("Failed to start rabbitmq consumer", error)
    }
}