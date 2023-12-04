import { BIT, PASSWORD_STATUS, USER_PASSWORD_LABEL } from "../common/constants/app_constants";
import AppValidator from "../middlewares/validators/AppValidator";
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
    
                if (activeLoginSession.validity_end_date > new Date()) {
                    activeLoginSession.logged_out = true;
                    activeLoginSession.validity_end_date = new Date();
                } else {
                    activeLoginSession.expired = true
                }
                activeLoginSession.status = BIT.OFF;
                await activeLoginSession.save();

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
            const session = await this.appUtils.createMongooseTransaction();
            try {
                const loggedInUser = this.requestService.getLoggedInUser();
                const previousPassword = this.requestService.getDataFromState(USER_PASSWORD_LABEL);

                const passwordData = {
                    password: req.body.password,
                    email: loggedInUser.email,
                    user: loggedInUser._id
                }
                await this.passwordService.save(passwordData, session);
                //Deactivate old password
                await this.passwordService.updateById(previousPassword._id, {status: PASSWORD_STATUS.DEACTIVATED});

                await session.commitTransaction();
                next();
            } catch (error:any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500, session) 
            }
        });

        this.router.patch(path, this.userMiddleWare.logoutExistingSession);
        this.router.patch(path, async (req, res) => {
            try {
                const user = this.requestService.getLoggedInUser();
    
                const loginSessionData = {
                    user: user._id,
                    status: BIT.ON
                };
                const loginSession = await this.loginSessionService.save(loginSessionData);
                const token = this.appUtils.createAuthToken(user._id, loginSession._id);
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