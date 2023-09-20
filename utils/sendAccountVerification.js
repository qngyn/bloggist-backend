import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const sendVerification = async (to, resetToken) => {
    try {
        //create transport 

        const transport = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            }
        });

        const message = {
            to, 
            subject: 'Account Verification',
            html:
            `
            <p>You are receiving this email because you (or someone else) have requested the create a new account</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <p>http://localhost:3000/reset-password/${resetToken}</p>
            <p>If you did not request this, please ignore this email and your account will not be created.</p>
            `
        }

        //send the actual email 
        const info = await transport.sendMail(message);
        console.log('Email sent', info.messageId)
    } catch (error) {
        console.log('Email not sent', error.message)
        throw new Error('Email not sent')
    }
}

export default sendVerification;