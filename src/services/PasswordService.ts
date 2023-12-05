import DBService from './DBService';
import UserPassword, { user_password_table } from '../models/user_password';

class PasswordService extends DBService<UserPassword> {

    constructor() {
        super(user_password_table);
    }
}

export default PasswordService;
