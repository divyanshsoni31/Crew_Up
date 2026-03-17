import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
});

export const sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.USER,
            to: email,
            subject: 'CrewUp - Your Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #8b5cf6; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">CrewUp</h1>
                    </div>
                    <div style="padding: 30px; text-align: center;">
                        <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email Address</h2>
                        <p style="color: #64748b; font-size: 16px;">Thank you for registering with CrewUp! Please use the generous OTP below to complete your sign-up process.</p>
                        <div style="background-color: #f1f5f9; padding: 20px; margin: 30px 0; border-radius: 8px;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8b5cf6;">${otp}</span>
                        </div>
                        <p style="color: #94a3b8; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
