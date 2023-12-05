
interface OTP {
    id?: string,
    code: string,
    type: string,
    user_id: number,
    status: string,
    created_at: Date
}

export const otp_table = "otp";
export default OTP;
