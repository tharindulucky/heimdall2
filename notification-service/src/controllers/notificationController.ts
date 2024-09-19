import {sendEmail} from "../utils/mailer";
import path from "node:path";
import * as fs from "fs";
import {writeLog} from "../utils/logger";

export const getEmailTemplate = async (templateName: string, replacements: any) => {
    const filePath = path.join(__dirname, '../templates/email', templateName);
    let template = fs.readFileSync(filePath, 'utf8');

    // Replace placeholders with actual values
    for (const [key, value] of Object.entries(replacements)) {
        //@ts-ignore
        template = template.replace(`{{${key}}}`, value);
    }

    return template;
}

export const composeEmail = async (payload: any) => {
    try {
        const htmlContent = await getEmailTemplate(`${payload.template}.html`, payload.data.content);
        await sendEmail(payload, htmlContent);
    } catch (e) {
        console.error("Error composing email - "+e);
        writeLog('ERROR', 'Error composing email!', JSON.stringify(e));
    }
}