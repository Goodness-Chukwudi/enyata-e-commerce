import User from "./user";

interface OTP {
    id?: number,
    code: string,
    type: string,
    user_id: number|User,
    status: string,
    created_at: Date
}

export const otp_table = "otps";
export default OTP;
