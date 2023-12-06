import { BIT, LOGIN_SESSION_VALIDITY, PASSWORD_STATUS, USER_PASSWORD_LABEL } from "../common/constants/app_constants";
import AppValidator from "../middlewares/validators/AppValidator";
import UserPassword from "../models/user_password";
import LoginSessionService from "../services/LoginSessionService";
import PasswordService from "../services/PasswordService";
import UserService from "../services/UserService";
import BaseApiController from "./base controllers/BaseApiController";



class AppController extends BaseApiController {

    userService: UserService;
    loginSessionService: LoginSessionService;
    passwordService: PasswordService;
    appValidator: AppValidator;

    constructor() {
        super();
    }

    protected initializeServices() {
        this.userService = new UserService();
        this.loginSessionService = new LoginSessionService();
        this.passwordService = new PasswordService();
    }
    
    protected initializeMiddleware() {
        this.appValidator = new AppValidator(this.router);
    }

    protected initializeRoutes() {
        this.me("/me"); //GET
        this.logout("/logout"); //PATCH
        this.updatePassword("/password"); //PATCH
    }

    me(path:string) {
        //returns the logged in user
        this.router.get(path, (req, res) => {
            const user = this.requestService.getLoggedInUser();
            this.sendSuccessResponse(res, user);
        })
    }


    logout(path:string) {
        this.router.patch(path, async (req, res) => {
            try {
                const activeLoginSession = this.requestService.getLoginSession();
    
                const query = {
                    condition: "id=$1",
                    values: [activeLoginSession.id]
                }
                const update:Record<string, any> = {}
                
                if (activeLoginSession.validity_end_date > new Date()) {
                    update.logged_out = true;
                    update.validity_end_date = new Date();
                } else {
                    update.expired = true
                }
                update.status = BIT.OFF;
                await this.loginSessionService.updateOne(query, update);

                this.sendSuccessResponse(res);
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
            }
        });
    }


    updatePassword(path:string) {
        this.router.patch(path,
            this.appValidator.validatePasswordUpdate,
            this.userMiddleWare.validatePassword,
            this.userMiddleWare.hashNewPassword
        );

        this.router.patch(path, async (req, res, next) => {
            const transaction = await this.appUtils.startDbTransaction();
            try {
                const loggedInUser = this.requestService.getLoggedInUser();
                const previousPassword:UserPassword = this.requestService.getDataFromState(USER_PASSWORD_LABEL);

                const passwordData = {
                    password: req.body.password,
                    email: loggedInUser.email,
                    user_id: loggedInUser.id!
                }
                await this.passwordService.save(passwordData, transaction);
                //Deactivate old password
                const query = {
                    condition: "id=$1",
                    values: [previousPassword.id]
                }
                await this.passwordService.updateOne(query, {status: PASSWORD_STATUS.DEACTIVATED});

                await this.appUtils.commitDbTransaction(transaction);
                next();
            } catch (error:any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500, transaction) 
            }
        });

        this.router.patch(path, this.userMiddleWare.logoutExistingSession);
        this.router.patch(path, async (req, res) => {
            try {
                const user = this.requestService.getLoggedInUser();
    
                const loginSessionData = {
                    user_id: user.id!,
                    status: BIT.ON,
                    validity_end_date: new Date(Date.now() + LOGIN_SESSION_VALIDITY)
                };
                const loginSession = await this.loginSessionService.save(loginSessionData);
                const token = this.appUtils.createAuthToken(user.id!, loginSession.id!);
                const response = {
                    message: this.successResponseMessage.PASSWORD_UPDATE_SUCCESSFUL,
                    token: token
                }
        
                this.sendSuccessResponse(res, response);                
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
            }
        });
    }
}

export default new AppController().router;