import BaseApiController from "./base controllers/BaseApiController";
import LoginSessionService from "../services/LoginSessionService";
import { BIT, LOGIN_SESSION_VALIDITY, OTP_TYPES, PASSWORD_STATUS, USER_PASSWORD_LABEL, USER_STATUS } from "../common/constants/app_constants";
import PasswordService from "../services/PasswordService";
import AppValidator from "../middlewares/validators/AppValidator";
import OtpService from "../services/OtpService";
import UserPassword from "../models/user_password";

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

            const transaction = await this.appUtils.startDbTransaction();
            
            try {
                const body = req.body;

                const userData = {
                    first_name: body.first_name,
                    last_name: body.last_name,
                    middle_name: body.middle_name,
                    email: body.email,
                    phone: body.phone,
                    gender: body.gender

                }

                const user = await this.userService.save(userData, transaction);
                console.log(user)

                const passwordData = {
                    password: body.password,
                    email: user.email,
                    user_id: user.id!
                }
                await this.passwordService.save(passwordData, transaction);

                const otp = await this.otpService.generateOTP(user.id!, OTP_TYPES.EMAIL_VERIFICATION, transaction);
                await this.userService.sendActivationOTP(user, otp);

                const response = {
                    message: this.successResponseMessage.ACTIVATION_CODE_SENT,
                    user: user.id
                }

                this.sendSuccessResponse(res, response, transaction, 201);
            } catch (error: any) {
                console.log(error.message)
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500, transaction);
            }
        });
    }

    generateActivationOTP(path:string) {
        this.router.post(path, this.userMiddleWare.loadUserByResetEmail);
        this.router.post(path, async (req, res) => {
            try {

                const user = await this.requestService.getLoggedInUser();

                const otp = await this.otpService.generateOTP(user.id!, OTP_TYPES.EMAIL_VERIFICATION);
                await this.userService.sendActivationOTP(user, otp);

                const response = {
                    message: this.successResponseMessage.ACTIVATION_CODE_SENT,
                    user: user.id
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

                const query = {
                    condition: "id=$1",
                    values: [user.id]
                };
                await this.userService.updateOne(query, {status: USER_STATUS.ACTIVE});

                const loginSessionData = {
                    user_id: user.id!,
                    status: BIT.ON,
                    validity_end_date: new Date(Date.now() + LOGIN_SESSION_VALIDITY)
                };
        
                const loginSession = await this.loginSessionService.save(loginSessionData);
                const token = this.appUtils.createAuthToken(user.id!, loginSession.id!);

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
                const otp = await this.otpService.generateOTP(user.id!, OTP_TYPES.LOGIN);
                await this.userService.sendLoginOTP(user, otp);

                this.sendSuccessResponse(res, {user: user.id, otp});
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
                    user_id: user.id!,
                    status: BIT.ON,
                    validity_end_date: new Date(Date.now() + LOGIN_SESSION_VALIDITY)
                };
        
                const loginSession = await this.loginSessionService.save(loginSessionData);
                const token = this.appUtils.createAuthToken(user.id!, loginSession.id!);


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

            const transaction = await this.appUtils.startDbTransaction();
            try {
                const user = this.requestService.getLoggedInUser();

                const otp = await this.otpService.generateOTP(user.id!, OTP_TYPES.PASSWORD_RESET, transaction);
                await this.userService.sendPasswordResetOTP(user, otp);

                this.sendSuccessResponse(res, {}, transaction);
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500, transaction);
            }
        });
    }

    resetPassword(path:string) {
        this.router.patch(path, this.userMiddleWare.loadUserByResetEmail);
        this.router.patch(path, this.userMiddleWare.validateOTP);
        this.router.patch(path, this.userMiddleWare.hashNewPassword);

        this.router.patch(path, async (req, res, next) => {
            const transaction = await this.appUtils.startDbTransaction();
            try {
                const user = this.requestService.getLoggedInUser();
                const previousPassword:UserPassword = this.requestService.getDataFromState(USER_PASSWORD_LABEL);

                const password = {
                    password: req.body.password,
                    email: user.email,
                    user_id: user.id!
                }
                await this.passwordService.save(password, transaction);

                //Deactivate old password
                const query = {
                    condition: "id=$1",
                    values: [previousPassword.id]
                }
                await this.passwordService.updateOne(query, {status: PASSWORD_STATUS.DEACTIVATED});

                await this.appUtils.commitDbTransaction(transaction);
                next()
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500, transaction);
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

export default new AuthController().router;
