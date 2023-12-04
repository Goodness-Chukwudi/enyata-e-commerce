import LoginSession, {ILoginSession} from '../models/login_session';
import DBService from './DBService';

class LoginSessionService extends DBService<ILoginSession> {

    constructor(populatedFields:string[]|Record<string,string>[] = []) {
        super(LoginSession, populatedFields);
        
    }

}

export default LoginSessionService;
