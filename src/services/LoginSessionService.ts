import LoginSession, {login_session_table} from '../models/login_session';
import DBService from './DBService';

class LoginSessionService extends DBService<LoginSession> {

    constructor() {
        super(login_session_table,);
        
    }

}

export default LoginSessionService;
