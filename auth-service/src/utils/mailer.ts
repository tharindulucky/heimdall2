import {pushToQueue} from "./queueService";
import {IEmailPayload} from "../interfaces/types";
export const sendEmail = async (name: string, payload: IEmailPayload) => {
    switch (name) {
        case "EmailVerificationRequest":
            await pushToQueue("EmailQueue", {
                template: "auth/email-verification-request",
                data: {
                    to: payload.toAddress,
                    subject: payload.subject ?? "Verify your email!",
                    content: {
                        recipientName: payload.toName,
                        hash: payload.data.verificationHash
                    }
                }
            });
            break;
        case "PasswordResetRequest":
            await pushToQueue("EmailQueue", {
                template: "auth/password-reset-request",
                data: {
                    to: payload.toAddress,
                    subject: payload.subject ?? "Password reset request",
                    content: {
                        recipientName: payload.toName,
                        hash: payload.data.verificationHash
                    }
                }
            });
            break;
        case "EmailVerificationComplete":
            await pushToQueue("EmailQueue", {
                template: "auth/email-verification-complete",
                data: {
                    to: payload.toAddress,
                    subject: payload.subject ?? "Email verified successfully",
                    content: {
                        recipientName: payload.toName
                    }
                }
            });
            break;
        case "PasswordResetComplete":
            await pushToQueue("EmailQueue", {
                template: "auth/password-reset-complete",
                data: {
                    to: payload.toAddress,
                    subject: payload.subject ?? "Password reset successfully",
                    content: {
                        recipientName: payload.toName
                    }
                }
            });
            break;
        case "PasswordUpdateComplete":
            await pushToQueue("EmailQueue", {
                template: "auth/password-reset-request",
                data: {
                    to: payload.toAddress,
                    subject: payload.subject ?? "Password changed!",
                    content: {
                        recipientName: payload.toName
                    }
                }
            });
            break;
    }
}