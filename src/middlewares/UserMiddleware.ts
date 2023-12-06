import AppUtils from "../common/utils/AppUtils";
import BaseRouterMiddleware from "./BaseRouterMiddleware";
import { USER_STATUS, USER_LABEL, BIT, USER_PASSWORD_LABEL, PASSWORD_STATUS } from '../common/constants/app_constants';
import { NextFunction, Request, Response, Router } from 'express';
import LoginSessionService from "../services/LoginSessionService";
import PasswordService from "../services/PasswordService";
import OtpService from "../services/OtpService";
import { user_table } from "../models/user";

class UserMiddleware extends BaseRouterMiddleware {

    private appUtils: AppUtils;
    private loginSessionService: LoginSessionService;
    private passwordService: PasswordService;
    private otpService: OtpService;

    constructor(appRouter: Router) {
        super(appRouter)
    }

    protected initServices() {

        this.appUtils = new AppUtils();
        this.loginSessionService = new LoginSessionService();
        this.otpService = new OtpService();
        this.passwordService = new PasswordService();

    }

    /**
     * A middleware that fetches a user from the db using the email provided in the request.
     * - The fetched user is available through the getDataFromState or getLoggedInUser method of the request service
    */
    public loadUserToRequestByEmail = async (req: Request, res: Response, next: NextFunction) => {

        try {
            const email = req.body.email;
    
            if (!email) {
                const error = new Error("email is required");
                return this.sendErrorResponse(res, error, this.errorResponseMessage.requiredField("Email"), 400);
            }
    
            const query = {
                condition: "email=$1 AND status=$2",
                values: [email, PASSWORD_STATUS.ACTIVE]
            };
                        
            const password = await this.passwordService.findOne(query);
            if (!password) return this.sendErrorResponse(res, new Error("User not found"), this.errorResponseMessage.INVALID_LOGIN, 400)
    
            //@ts-ignore
            const user = await this.userService.findById(password.user_id);
            this.requestService.addDataToState(USER_LABEL, user);
            this.requestService.addDataToState(USER_PASSWORD_LABEL, password);
            next();
        } catch (error:any) {
            return this.sendErrorResponse( res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500 );
        }
    }

    /**
     * A middleware that fetches a user from the db using the email provided in the request.
     * - The fetched user is available through the getDataFromState or getLoggedInUser method of the request service
    */
    public loadUserByResetEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email = req.body.email;
    
            if (!email) {
                const error = new Error("email is required");
                return this.sendErrorResponse(res, error, this.errorResponseMessage.requiredField("Email"), 400)
            }
    
            const emailRegex = new RegExp(/^([a-z0-9]+(?:[._-][a-z0-9]+)*)@([a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,})$/, "i");
            if (!emailRegex.test(email)) {
                const error = new Error("Invalid email format");
                return this.sendErrorResponse(res, error, this.errorResponseMessage.INVALID_EMAIL, 400);
            }
    
            const query = {
                condition: "user_passwords.email=$1",
                values: [email]
            };

            const password = await this.passwordService.findOne(query);
            if (!password) {
                return this.sendErrorResponse(res, new Error("User not found"), this.errorResponseMessage.resourceNotFound("User"), 400)
            }
            //@ts-ignore
            const user = await this.userService.findById(password.user_id)
            this.requestService.addDataToState(USER_LABEL, user);
            this.requestService.addDataToState(USER_PASSWORD_LABEL, password);
        
            req.body.user_id = user.id;
            next();
            
        } catch (error: any) {
            return this.sendErrorResponse( res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500 );
            
        }
    }

    /**
     * Validates the status of the user that's about to login.
     * - Returns the appropriate error response for users with invalid status
    */
    public checkUserStatus = (req: Request, res: Response, next: NextFunction) => {
        const user = this.requestService.getLoggedInUser();
        const status = user.status;

        switch(status) {
            case USER_STATUS.ACTIVE:
            case USER_STATUS.SELF_DEACTIVATED: {
               return next();
            }
            case USER_STATUS.SUSPENDED:
            case USER_STATUS.DEACTIVATED: {
               return this.sendErrorResponse( res, new Error("Account blocked"), this.errorResponseMessage.ACCOUNT_BLOCKED, 400 );
            }
            
            case USER_STATUS.PENDING: {
               return this.sendErrorResponse( res, new Error("Account pending"), this.errorResponseMessage.ACCOUNT_PENDING, 400 );
            }

            case undefined:
            case "":
            case null: {
                return this.sendErrorResponse(res, new Error("Invalid user status"), this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 400)
            }

            default: return this.sendErrorResponse( res, new Error("Account status is " + status), this.errorResponseMessage.CONTACT_ADMIN, 400 );
        }
    }

    /**
     * Hashes a new password.
     * - Returns an invalid login error response for invalid password
    */
    public hashNewPassword = async (req: Request, res: Response, next: any) => {
        try {
            if (req.body.new_password) {
    
                if (req.body.confirm_password != req.body.new_password) {
                    const error = new Error("Passwords do not match");
                    return this.sendErrorResponse(res, error, this.errorResponseMessage.PASSWORD_MISMATCH, 400);
                }
    
                req.body.password = await this.appUtils.hashData(req.body.new_password);
    
                next();
            } else {
                const error  =  new Error("No password provided");
                return this.sendErrorResponse(res, error, this.errorResponseMessage.requiredField("password"), 400)
            }
            
        } catch (error:any) {
            this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
        }

    }

    public validateOTP = async (req: Request, res: Response, next: any) => {
        const otp = req.body.otp;
        const userId = req.body.user_id;
        try {
            if (otp) {
                const user = await this.userService.findById(userId);
                if (!user) {
                    const error = new Error("Invalid user id provided");
                    return this.sendErrorResponse(res, error, this.errorResponseMessage.INVALID_OTP, 400);
                }
                console.log("BEFORE VALID")
                const isValid = await this.otpService.validateOTP(userId, otp);
                if (isValid) {
                    this.requestService.addDataToState(USER_LABEL, user);
                    return next();
                }
            }

            const error = new Error("Invalid or expired otp");
            return this.sendErrorResponse(res, error, this.errorResponseMessage.INVALID_OTP, 400);
        } catch (error:any) {
            return this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
        }

    }

    /**
     * Validates user's password.
     * - Returns an invalid login error response for invalid password
    */
    public validatePassword = async (req: Request, res: Response, next: any) => {
        try {
            const user = this.requestService.getLoggedInUser();

            const query = {
                condition: "user_id=$1",
                values: [user.id]
            };
    
            const userPassword = await this.passwordService.findOne(query);
            const isCorrectPassword = await this.appUtils.validateHashedData(req.body.password, userPassword.password);
            if (!isCorrectPassword) return this.sendErrorResponse(res, new Error("Wrong password"), this.errorResponseMessage.INVALID_LOGIN, 400);

            this.requestService.addDataToState(USER_PASSWORD_LABEL, userPassword);

            next();
        } catch (error:any) {
            return this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_LOGIN, 400);
        }

    }

    /**
     * Logs out the user from other devices who's session hasn't expired yet.
    */
    public logoutExistingSession = async (req: Request, res: Response, next: any) => {
        const user = this.requestService.getLoggedInUser();
        try {
            const query = {
                condition: "status=$1 AND user_id=$2",
                values: [BIT.ON, user.id]
            };
            const activeLoginSession = await this.loginSessionService.findOne(query);

            const update:Record<string, any> = {};

            if(activeLoginSession) {
                if (activeLoginSession.validity_end_date > new Date()) {
                    update.logged_out = true;
                    update.validity_end_date = new Date();
                } else {
                    update.expired = true
                }
                update.status = BIT.OFF;

                await this.loginSessionService.updateOne(query, update);
            }
            next();

        } catch (error: any) {
            return this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_LOGIN, 500);
        }
    }

    public validateEmail = (req:Request, res:Response, next:any) => {
        const email = req.body.email;
        if (!email) {
            const error = new Error("Email is required");
            return this.sendErrorResponse(res, error, this.errorResponseMessage.requiredField("Email"), 400);
        }

        const emailRegex = new RegExp(/^([a-z0-9]+(?:[._-][a-z0-9]+)*)@([a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,})$/, "i");
        if (!emailRegex.test(email)) {
            const error =  new Error("Invalid email address");
            return this.sendErrorResponse(res, error, this.errorResponseMessage.INVALID_EMAIL, 400);
        }
        const query = {
            condition: "email=$1",
            values: [email]
        };
        this.userService.findOne(query)
            .then((user) => {
                if (user) {
                    const error = new Error("Email already exists");
                    return this.sendErrorResponse(res, error, this.errorResponseMessage.DUPLICATE_EMAIL, 400);
                }
                next();
            })
            .catch((err) => {
                this.sendErrorResponse(res, err, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
            })
    }

    public validatePhone = (req:Request, res:Response, next:any) => {
        const phone = req.body.phone;
        if (!phone) {
            const error = new Error("Phone number is required");
            return this.sendErrorResponse(res, error, this.errorResponseMessage.requiredField("Phone"), 400);
        }
        const query = {
            condition: "phone=$1",
            values: [phone]
        };

        this.userService.findOne(query)
            .then((user) => {
                if (user) {
                    const error = new Error("Phone number already exists");
                    return this.sendErrorResponse(res, error, this.errorResponseMessage.DUPLICATE_PHONE, 400);
                }
                next();
            })
            .catch((err) => {
                this.sendErrorResponse(res, err, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
            })
    }
}

export default UserMiddleware;
