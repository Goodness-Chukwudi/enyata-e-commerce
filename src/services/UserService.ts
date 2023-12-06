import DBService from './DBService';
import User, { user_table } from '../models/user';
import EmailService from '../common/utils/EmailService';
import EmailTemplateUtils from '../common/utils/EmailTemplateUtils';
import AppUtils from '../common/utils/AppUtils';
import { OTP_TYPES, USER_STATUS } from '../common/constants/app_constants';
import Env from '../common/configs/environment_config';
import PasswordService from './PasswordService';
import OtpService from './OtpService';

class UserService extends DBService<User> {
    
    emailService: EmailService;
    emailTemplateUtils: EmailTemplateUtils;
    appUtils: AppUtils;
    userService: UserService;
    passwordService: PasswordService;
    otpService: OtpService;

    constructor() {
        super(user_table);
    }

    async sendLoginOTP(user: User, otp: string) {
        try {
            this.emailService = new EmailService();
            this.emailTemplateUtils = new EmailTemplateUtils();

            const recipient = user.email;
            const subject = "Login OTP";
            const htmlTemplate = this.emailTemplateUtils.generateLoginTemplate(user.first_name, otp);

            await this.emailService.sendCode(recipient, subject, htmlTemplate);
        } catch (error) {
            throw error;
        }
    }

    async sendActivationOTP(user: User, otp: string) {
        try {
            this.emailService = new EmailService();
            this.emailTemplateUtils = new EmailTemplateUtils();

            const recipient = user.email;
            const subject = "Account Activation";
            const htmlTemplate = this.emailTemplateUtils.generateActivationTemplate(user.first_name, otp);

            await this.emailService.sendCode(recipient, subject, htmlTemplate);
        } catch (error) {
            throw error;
        }
    }

    async sendPasswordResetOTP(user: User, otp: string) {
        try {
            this.emailService = new EmailService();
            this.emailTemplateUtils = new EmailTemplateUtils();

            const recipient = user.email;
            const subject = "Account Password Reset";
            const htmlTemplate = this.emailTemplateUtils.generatePasswordResetTemplate(user.first_name, otp);
            
            await this.emailService.sendCode(recipient, subject, htmlTemplate);
        } catch (error) {
            throw error;
        }
    }

        /**
     * Creates an admin user on app start up if there's no existing admin in the database
     */
        async createDefaultAdmin() {
            this.appUtils = new AppUtils();
            this.userService = new UserService();
            this.passwordService = new PasswordService();
            this.otpService = new OtpService();
            const transaction = await this.appUtils.startDbTransaction();
    
            try {
                //check if there's an existing admin user
                const query = {
                    condition: "is_admin=$1 AND status!=$2",
                    values: [true, USER_STATUS.DEACTIVATED]
                };
                const existingAdmin = await this.findOne(query);
                if (!existingAdmin) {
                    //Proceed only when there's no existing admin user
    
                    //Create admin user from environment config

                    const userData = {
                        first_name: Env.SUPER_ADMIN_FIRST_NAME,
                        last_name: Env.SUPER_ADMIN_LAST_NAME,
                        middle_name: Env.SUPER_ADMIN_MIDDLE_NAME,
                        email: Env.SUPER_ADMIN_EMAIL,
                        phone: Env.SUPER_ADMIN_PHONE,
                        gender: Env.SUPER_ADMIN_GENDER,
                        status: USER_STATUS.ACTIVE,
                        is_admin: true
    
                    }
    
                    const user = await this.userService.save(userData, transaction);
    
                    const password = await this.appUtils.hashData(this.appUtils.createDefaultPassword());
                    const passwordData = {
                        password: password,
                        email: user.email,
                        user_id: user.id!
                    }
                    await this.passwordService.save(passwordData, transaction);
    
                    const otp = await this.otpService.generateOTP(user.id!, OTP_TYPES.EMAIL_VERIFICATION, transaction);
                    await this.userService.sendActivationOTP(user, otp);

                    await this.appUtils.commitDbTransaction(transaction);
                }
    
            } catch (error) {
                await await this.appUtils.rollBackDbTransaction(transaction);
                console.log("Unable to create admin user!", error);
            }
        }
}

export default UserService;
