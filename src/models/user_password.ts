import User from "./user";

 interface UserPassword {
    id?: number,
    password: string,
    email: string,
    user_id: number|User,
    status: string,
    created_at: Date
}

export const user_password_table = "user_passwords";

export default UserPassword;
