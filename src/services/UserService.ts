import DBService from './DBService';
import User, { IUser } from '../models/user';
import EmailService from '../common/utils/EmailService';
import EmailTemplateUtils from '../common/utils/EmailTemplateUtils';

class UserService extends DBService<IUser> {
    
    emailService: EmailService;
    emailTemplateUtils: EmailTemplateUtils;

    constructor(populatedFields:string[]|Record<string,string>[] = []) {
        super(User, populatedFields);
    }

    async sendLoginOTP(user: IUser, otp: string) {
        try {
            this.emailService = new EmailService();
            this.emailTemplateUtils = new EmailTemplateUtils();

            const recipient = user.email;
            const subject = "Fuuti Login OTP";
            const htmlTemplate = this.emailTemplateUtils.generateLoginTemplate(user.username, otp);

            await this.emailService.sendCode(recipient, subject, htmlTemplate);
        } catch (error) {
            throw error;
        }
    }

    async sendActivationOTP(user: IUser, otp: string) {
        try {
            this.emailService = new EmailService();
            this.emailTemplateUtils = new EmailTemplateUtils();

            const recipient = user.email;
            const subject = "Fuuti Account Activation";
            const htmlTemplate = this.emailTemplateUtils.generateActivationTemplate(user.username, otp);

            await this.emailService.sendCode(recipient, subject, htmlTemplate);
        } catch (error) {
            throw error;
        }
    }

    async sendPasswordResetOTP(user: IUser, otp: string) {
        try {
            this.emailService = new EmailService();
            this.emailTemplateUtils = new EmailTemplateUtils();

            const recipient = user.email;
            const subject = "Fuuti Account Password Reset";
            const htmlTemplate = this.emailTemplateUtils.generatePasswordResetTemplate(user.username, otp);
            
            await this.emailService.sendCode(recipient, subject, htmlTemplate);
        } catch (error) {
            throw error;
        }
    }
}

export default UserService;
