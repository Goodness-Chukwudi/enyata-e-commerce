import User from "./user";

interface LoginSession {
    id?: number,
    user_id: number|User,
    status: number,
    validity_end_date: Date,
    logged_out: boolean,
    expired: boolean,
    created_at: Date
}

export const login_session_table = "login_sessions";
export default LoginSession;
