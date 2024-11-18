import nodemailer from 'nodemailer';
require('dotenv').config();
const email = process.env.EMAIL_NAME;
const password = process.env.EMAIL_PASSWORD;

// config

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: email,
        pass: password
    }
});

export const createMailOptions = (to, subject, content) => {
    return {
        from: email,
        to: to,
        subject: subject,
        html: content
    };
}

const sendMailVerify = async (email, otp) => {
    // Tiêu đề email
    const title = 'Verify Your Email - Zalo';

    // Nội dung email
    const body = `<p>Your OTP is: <span style="font-weight: 720">${otp}</span></p>`;

    // Tạo HTML template cho email
    const emailTemplate = (title, body) => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                /* CSS cho nội dung email */
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                }
                h2 {
                    color: #007bff;
                }
                p {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <h2>${title}</h2>
            <p>${body}</p>
        </body>
        </html>
    `;

    // Tạo mailOption và gửi email
    const mailOption = createMailOptions(email, title, emailTemplate(title, body));
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOption, (error, info) => {
            if (error) {
                reject(false);
            } else {
                resolve(true);
            }
        });
    })
};


module.exports = {
    sendMailVerify
}