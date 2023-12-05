
interface LoginSession {
    id?: string,
    user_id: number,
    status: number,
    validity_end_date: Date,
    logged_out: boolean,
    expired: boolean,
    created_at: Date
}

export const login_session_table = "login_sessions";
export default LoginSession;
