import DBService from './DBService';
import AppUtils from '../common/utils/AppUtils';
import { OTP_STATUS, OTP_VALIDITY_PERIOD } from '../common/constants/app_constants';
import PasswordService from './PasswordService';
import OTP, { otp_table } from '../models/otp';
import { ClientSession } from 'mongoose';
import DateUtils from '../common/utils/DateUtils';

class OtpService extends DBService<OTP> {
    
    passwordService: PasswordService;
    appUtils: AppUtils;
    dateUtils: DateUtils;

    constructor() {
        super(otp_table);

        this.passwordService = new PasswordService();
        this.appUtils = new AppUtils();
        this.dateUtils = new DateUtils();
    }


    async generateOTP(user:string, type:string, session?: ClientSession): Promise<string> {
        try {
            
            await this.updateMany({user: user, status: OTP_STATUS.ACTIVE}, {status: OTP_STATUS.DEACTIVATED});
            const otp = this.appUtils.generateOTP();
            const otpData = {
                code: await this.appUtils.hashData(otp),
                type: type,
                user: user
            }
            
            await this.save(otpData, session)
            return otp;
        } catch (error) {
            throw error;
        }
    }

    async validateOTP(user:string, otp:string): Promise<boolean> {
        try {
            
            const savedOtp = await this.findOne({user: user, status: OTP_STATUS.ACTIVE});
            if (!savedOtp) return false;

            //@ts-ignore
            const otpAge = this.dateUtils.getDateDifference(savedOtp.created_at, new Date(), "minutes");
            if (otpAge < OTP_VALIDITY_PERIOD) {
                const isValid = await this.appUtils.validateHashedData(otp, savedOtp.code);
                if (isValid) {
                    await this.updateMany({user: user, status: OTP_STATUS.ACTIVE}, {status: OTP_STATUS.USED});
                    return true;
                }
            } else {
                await this.updateMany({user: user, status: OTP_STATUS.ACTIVE}, {status: OTP_STATUS.DEACTIVATED});
            }
            
            return false;
        } catch (error) {
            throw error;
        }
    }
}

export default OtpService;