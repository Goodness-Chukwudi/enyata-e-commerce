import DBService from './DBService';
import AppUtils from '../common/utils/AppUtils';
import { OTP_STATUS, OTP_VALIDITY_PERIOD } from '../common/constants/app_constants';
import PasswordService from './PasswordService';
import OTP, { otp_table } from '../models/otp';
import DateUtils from '../common/utils/DateUtils';
import { PoolClient } from 'pg';

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


    async generateOTP(user:number, type:string, transaction?: PoolClient): Promise<string> {
        try {
            
            const query = {
                condition: "user_id=$1 AND status=$2",
                values: [user, OTP_STATUS.ACTIVE]
            }
            
            await this.update(query, {status: OTP_STATUS.DEACTIVATED}, transaction);
            const otp = this.appUtils.generateOTP();
            const otpData = {
                code: await this.appUtils.hashData(otp),
                type: type,
                user_id: user
            }
            
            await this.save(otpData, transaction);
            return otp;
        } catch (error) {
            throw error;
        }
    }

    async validateOTP(user:number, otp:string): Promise<boolean> {
        try {
            const otpQuery = {
                condition: "user_id=$1 AND status=$2",
                values: [user, OTP_STATUS.ACTIVE]
            }

            const savedOtp = await this.findOne(otpQuery);
            if (!savedOtp) return false;

            const updateActiveQuery = {
                condition: "user_id=$1 AND status=$2",
                values: [user, OTP_STATUS.ACTIVE]
            }
            //@ts-ignore
            const otpAge = this.dateUtils.getDateDifference(savedOtp.created_at, new Date(), "minutes");
            if (otpAge < OTP_VALIDITY_PERIOD) {
                const isValid = await this.appUtils.validateHashedData(otp, savedOtp.code);
                if (isValid) {
                    await this.update(updateActiveQuery, {status: OTP_STATUS.USED});
                    return true;
                }
            } else {
                await this.update(updateActiveQuery, {status: OTP_STATUS.DEACTIVATED});
            }
            
            return false;
        } catch (error) {
            throw error;
        }
    }
}

export default OtpService;