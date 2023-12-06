interface User {
    id?: number,
    first_name: string,
    last_name: string,
    middle_name: string,
    email: string,
    phone: string,
    gender: string,
    require_new_password: boolean,
    is_admin: boolean,
    status: string,
    created_at: Date
}

export const user_table = "app_users";
export default User;
