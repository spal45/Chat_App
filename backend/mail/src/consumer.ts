import amqp from 'amqplib'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import dns from 'dns'

dotenv.config()

// Some container platforms (Railway included) resolve hostnames to IPv6
// first but can't actually route IPv6 egress, so an SMTP connection to a
// dual-stack host like smtp.gmail.com hangs until ETIMEDOUT/ENETUNREACH.
// Force IPv4 resolution to avoid it.
dns.setDefaultResultOrder('ipv4first')


export const startSendOtpConsumer = async()=>{
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