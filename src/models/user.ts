interface User {
    id?: string,
    first_name: string,
    last_name: string,
    middle_name: string,
    email: string,
    phone: string,
    gender: string,
    require_new_password: boolean,
    status: string,
    created_at: Date
}

export const user_table = "app_user";
export default User;
