import AppUtils from "../common/utils/AppUtils";
import BaseRouterMiddleware from "./BaseRouterMiddleware";
import { USER_LABEL, USER_STATUS } from "../common/constants/app_constants";
import { NextFunction, Request, Response, Router } from "express";
import { BIT, LOGIN_SESSION_LABEL } from "../common/constants/app_constants";
import LoginSessionService from "../services/LoginSessionService";
import { TokenExpiredError } from "jsonwebtoken";
import Env from "../common/configs/environment_config";
import { user_table } from "../models/user";

export class AuthMiddleware extends BaseRouterMiddleware {

    protected appUtils: AppUtils;
    protected loginSessionService: LoginSessionService;

    constructor(appRouter: Router) {
        super(appRouter);
    }

    protected initServices() {
        this.appUtils = new AppUtils();
        this.loginSessionService = new LoginSessionService();
    }

    public authGuard = (req: Request, res: Response, next: any) => {
        
        const jwt = this.appUtils.getTokenFromRequest(req);

        this.appUtils.verifyToken(jwt, async (error, decoded) => {
            try {
                if (error) {
                    if (error instanceof TokenExpiredError)
                        return this.sendErrorResponse(res, error, this.errorResponseMessage.SESSION_EXPIRED, 401);
                        
                    return this.sendErrorResponse(res, error, this.errorResponseMessage.INVALID_TOKEN, 401);
                } else {
                    const data = decoded.data || {};

                    const query = {
                        condition: "id=$1 AND user_id=$2 AND status=$3",
                        values: [data.loginSession, data.user, BIT.ON]
                    };

                    const loginSession = await this.loginSessionService.findOne(query);
                    if (loginSession?.id) {   
                        //@ts-ignore             
                        const user = await this.userService.findById(loginSession.user_id);
    
                        await this.validateLoginSession(loginSession, req, res);
    
                        this.requestService.addDataToState(USER_LABEL, user);
                        this.requestService.addDataToState(LOGIN_SESSION_LABEL, loginSession);
                        await this.checkUserStatus(req, res, next);  
                    } else {
                        const error =  new Error("Unable to validate user from token");
                        this.sendErrorResponse(res, error, this.errorResponseMessage.INVALID_SESSION_USER, 401);
                    }

                }
            } catch (error:any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 401);
            }
        })
    }

    private async validateLoginSession(loginSession: any, req: Request, res: Response): Promise<void> {
        try {
            if (loginSession.validity_end_date <= new Date()) {
                const query = {
                    condition: "id=$1",
                    values: [loginSession.id]
                }
                const update:Record<string, any> = {}

                update.expired = true;
                update.status = BIT.OFF;

                await this.loginSessionService.updateOne(query, update);
                const error = new Error("Session expired");
                return this.sendErrorResponse(res, error, this.errorResponseMessage.SESSION_EXPIRED, 401);
            }
        } catch (error) {
            throw error;
        }
    }

    private checkUserStatus(req:Request, res: Response, next:NextFunction) {
        const user = this.requestService.getLoggedInUser();
        const reqUrl = Env.API_PATH + req.url;
        //Ignore user status validation on the routes below if the status is pending or requires new password
        const canIgnoreStatus = 
            (reqUrl === Env.API_PATH+"/password" && req.method === "PATCH") ||
            (reqUrl === Env.API_PATH+"/logout" && req.method === "PATCH");

        if (user.require_new_password && !canIgnoreStatus) {
            const error = new Error("Password update required");
            return this.sendErrorResponse(res, error, this.errorResponseMessage.PASSWORD_UPDATE_REQUIRED, 403);
        }  

        const status = user.status;
        switch(status) {

            case USER_STATUS.ACTIVE: {
                return next();
             }

            case USER_STATUS.IN_REVIEW: {
                return this.sendErrorResponse( res, new Error("Account is in review"), this.errorResponseMessage.ACCOUNT_IS_IN_REVIEW, 403 );
            }

            case USER_STATUS.PENDING: {
                if (canIgnoreStatus) return next();
                return this.sendErrorResponse( res, new Error("Account is Pending"), this.errorResponseMessage.PASSWORD_UPDATE_REQUIRED, 403 );
            }

            case USER_STATUS.SELF_DEACTIVATED: {
                return this.sendErrorResponse( res, new Error("Account is self deactivated"), this.errorResponseMessage.ACCOUNT_ACTIVATION_REQUIRED, 403 );
            }

            case USER_STATUS.SUSPENDED:
            case USER_STATUS.DEACTIVATED: {
               return this.sendErrorResponse( res, new Error("Account blocked"), this.errorResponseMessage.ACCOUNT_BLOCKED, 403 );
            }

            case undefined:
            case "":
            case null: {
                return this.sendErrorResponse(res, new Error("Invalid user status"), this.errorResponseMessage.CONTACT_ADMIN, 403)
            }

            default: return this.sendErrorResponse( res, new Error("Account status is " + status), this.errorResponseMessage.CONTACT_ADMIN, 400 );
        }
    }
}

export default AuthMiddleware;
