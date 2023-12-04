import BaseApiController from "./base controllers/BaseApiController";
import LoginSessionService from "../services/LoginSessionService";
import { BIT, OTP_TYPES, PASSWORD_STATUS, USER_PASSWORD_LABEL, USER_STATUS } from "../common/constants/app_constants";
import PasswordService from "../services/PasswordService";
import AppValidator from "../middlewares/validators/AppValidator";
import OtpService from "../services/OtpService";

class AuthController extends BaseApiController {

    private loginSessionService: LoginSessionService;
    private passwordService: PasswordService;
    private appValidator: AppValidator;
    private otpService: OtpService;

    constructor() {
        super();
    }
    
    protected initializeServices() {
        this.loginSessionService = new LoginSessionService();
        this.passwordService = new PasswordService();
        this.otpService = new OtpService();
    }
    
    protected initializeMiddleware() {
        this.appValidator = new AppValidator(this.router);
    }

    protected initializeRoutes() {
        this.signup("/register"); //POST
        this.generateActivationOTP("/activation/otp"); //POST
        this.verifyEmail("/verify_email"); //PATCH
        this.login("/login"); //POST
        this.verifyLoginOTP("/login/otp"); //POST
        this.generatePasswordResetOTP("/password"); //POST
        this.resetPassword("/password"); //PATCH
    }

    signup(path:string) {
        this.router.post(path, this.appValidator.validateSignup);
        this.router.post(path, this.userMiddleWare.hashNewPassword);
        this.router.post(path, async (req, res) => {
            const session = await this.appUtils.createMongooseTransaction();
            try {
                const body = req.body;
                const userData = {
                    username: body.username,
                    email: body.email,
                    phone: body.phone,
                }

                const user = await this.userService.save(userData, session);

                const passwordData = {
                    password: body.password,
                    email: user.email,
                    user: user._id
                }
                await this.passwordService.save(passwordData, session);

                const otp = await this.otpService.generateOTP(user._id, OTP_TYPES.EMAIL_VERIFICATION, session);
                await this.userService.sendActivationOTP(user, otp);

                const response = {
                    message: this.successResponseMessage.ACTIVATION_CODE_SENT,
                    user: user._id
                }

                this.sendSuccessResponse(res, response, session, 201);
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500, session);
            }
        });
    }

    generateActivationOTP(path:string) {
        this.router.post(path, this.userMiddleWare.loadUserByResetEmail);
        this.router.post(path, async (req, res) => {
            try {

                const user = await this.requestService.getLoggedInUser();

                const otp = await this.otpService.generateOTP(user._id, OTP_TYPES.EMAIL_VERIFICATION);
                await this.userService.sendActivationOTP(user, otp);

                const response = {
                    message: this.successResponseMessage.ACTIVATION_CODE_SENT,
                    user: user._id
                }
                this.sendSuccessResponse(res, response);
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
            }
        });
    }

    verifyEmail(path:string) {
        this.router.patch(path, this.userMiddleWare.validateOTP);
        this.router.patch(path, async (req, res) => {
            try {
                const user = this.requestService.getLoggedInUser();

                await this.userService.updateById(user._id, {status: USER_STATUS.ACTIVE});

                const loginSessionData = {
                    user: user._id,
                    status: BIT.ON
                };
        
                const loginSession = await this.loginSessionService.save(loginSessionData);
                const token = this.appUtils.createAuthToken(user._id, loginSession._id);

                const response = {
                    message: this.successResponseMessage.ACCOUNT_ACTIVATION_SUCCESSFUL,
                    token: token
                }

                this.sendSuccessResponse(res, response);
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
            }
        });
    }

    login(path:string) {
        this.router.post(path,
            this.userMiddleWare.loadUserToRequestByEmail,
            this.userMiddleWare.checkUserStatus,
            this.userMiddleWare.validatePassword
        );

        this.router.post(path, async (req, res) => {
            
            try {
                
                const user = this.requestService.getLoggedInUser();
                const otp = await this.otpService.generateOTP(user._id, OTP_TYPES.LOGIN);
                await this.userService.sendLoginOTP(user, otp);

                this.sendSuccessResponse(res, {user: user._id, otp});
            } catch (error:any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_LOGIN, 500);
            }
        });
    }

    verifyLoginOTP(path:string) {
        this.router.post(path,
            this.userMiddleWare.validateOTP,
            this.userMiddleWare.logoutExistingSession
        );

        this.router.post(path, async (req, res) => {
            const user = this.requestService.getLoggedInUser();

            try {
                const loginSessionData = {
                    user: user._id,
                    status: BIT.ON
                };
        
                const loginSession = await this.loginSessionService.save(loginSessionData);
                const token = this.appUtils.createAuthToken(user._id, loginSession._id);


                const response = {
                    message: this.successResponseMessage.LOGIN_SUCCESSFUL,
                    token: token
                }

                this.sendSuccessResponse(res, response);
            } catch (error:any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_LOGIN, 500);
            }
        });
    }

    generatePasswordResetOTP(path:string) {
        this.router.post(path, this.userMiddleWare.loadUserByResetEmail);
        this.router.post(path, async (req, res) => {

            const session = await this.appUtils.createMongooseTransaction();
            try {
                const user = this.requestService.getLoggedInUser();

                const otp = await this.otpService.generateOTP(user._id, OTP_TYPES.PASSWORD_RESET);
                await this.userService.sendPasswordResetOTP(user, otp);

                this.sendSuccessResponse(res, {}, session);
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500, session);
            }
        });
    }

    resetPassword(path:string) {
        this.router.patch(path, this.userMiddleWare.loadUserByResetEmail);
        this.router.patch(path, this.userMiddleWare.validateOTP);
        this.router.patch(path, this.userMiddleWare.hashNewPassword);

        this.router.patch(path, async (req, res, next) => {
            const session = await this.appUtils.createMongooseTransaction();
            try {
                const user = this.requestService.getLoggedInUser();
                const previousPassword = this.requestService.getDataFromState(USER_PASSWORD_LABEL);

                const password = {
                    password: req.body.password,
                    email: user.email,
                    user: user._id
                }
                await this.passwordService.save(password, session);
                //Deactivate old password
                await this.passwordService.updateById(previousPassword._id, {status: PASSWORD_STATUS.DEACTIVATED});

                await session.commitTransaction();
                next()
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500, session);
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

export default new AuthController().router;
