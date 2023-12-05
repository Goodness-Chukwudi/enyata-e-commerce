
 interface UserPassword {
    password: string,
    email: string,
    user_id: number,
    status: string,
    id: number,
    created_at: Date
}

export const user_password_table = "user_password";

export default UserPassword;
