import sgMail from "@sendgrid/mail";
import Env from "../configs/environment_config";


class EmailTemplateUtils {

    constructor() {
        sgMail.setApiKey(Env.SENDGRID_API_KEY!);
    }
    
    generateLoginTemplate(name: string, otp: string) {
        return `

            <body>
                <div>Dear ${name}, use the otp below to complete your login.

                <bold>${otp}</bold>
            </body>
        `
    }

    generateActivationTemplate(name: string, otp: string) {
        return `

            <body>
                <div>Dear ${name}, welcome to Enyeta!. Use the otp below to complete your sign up</div>

                <bold>${otp}</bold>
            </body>
        `
    }

    generatePasswordResetTemplate(name: string, otp: string) {
        return `

            <body>
                <div>Dear ${name}, use the otp below to set up a new password.

                <bold>${otp}</bold>
            </body>
        `
    }
}

export default EmailTemplateUtils;