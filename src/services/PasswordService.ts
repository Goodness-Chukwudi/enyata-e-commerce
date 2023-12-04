import DBService from './DBService';
import UserPassword, { IUserPassword } from '../models/user_password';

class PasswordService extends DBService<IUserPassword> {

    constructor(populatedFields:string[]|Record<string,string>[] = []) {
        super(UserPassword, populatedFields);
    }
}

export default PasswordService;
