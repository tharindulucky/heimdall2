import nodemailer from "nodemailer"
import configs from "../configs";
import {writeLog} from "./logger";
export const sendEmail = async (payload: any, htmlContent: any) => {
    try{
        let transporter = nodemailer.createTransport({
            host: configs.emailService.host,
            port: parseInt(configs.emailService.port),
            secure: false, // true for 465, false for other ports
            auth: {
                user: configs.emailService.user, // your Brevo SMTP username
                pass: configs.emailService.pass, // your Brevo SMTP password
            },
        });

        let mailOptions = {
            from: configs.emailService.senderAddr,
            to: payload.data.to,
            subject: payload.data.subject,
            html: htmlContent.toString(),
        };

        await transporter.sendMail(mailOptions);

        console.info("Email sent - " + payload.data.subject);
        writeLog('INFO', 'Email sent! - '+payload.data.subject, null);
    }catch (e) {
        writeLog('ERROR', 'Email sending failed!', JSON.stringify(e));
        console.log("Email sending failed!" + e)
    }
}