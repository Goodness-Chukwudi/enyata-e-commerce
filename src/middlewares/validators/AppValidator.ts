import { NextFunction, Request, Response, Router } from "express";
import Joi from "joi";
import BaseRouterMiddleware from "../BaseRouterMiddleware";
import { JoiValidatorOptions } from "../../common/configs/app_config";

class AppValidator extends BaseRouterMiddleware {

    constructor(appRouter: Router) {
        super(appRouter);
    }

    protected initServices(): void {

    }

    validateSignup = async ( req: Request, res: Response, next: NextFunction ) => {
        try {
            req.body.email = req.body.email.toLowerCase();
            const body = req.body;

            const BodySchema = Joi.object({
                email: Joi.string().email().required(),
                username: Joi.string().regex(new RegExp(/^\S+$/)).message("username validation failed").required(),
                new_password: Joi.string().min(8).required(),
                confirm_password: Joi.string().required()
            });
            
            await BodySchema.validateAsync(req.body, JoiValidatorOptions);

            const nameRegex = new RegExp(`^${body.username}$`, "i");
            const existingUser = await this.userService.findOne({$or: [{email: body.email}, {phone: body.phone}, {username: nameRegex}]});
            if(existingUser) {
                if (existingUser.email == body.email) {
                    const error = new Error("A user with this email already exist");
                    return this.sendErrorResponse(res, error, this.errorResponseMessage.DUPLICATE_EMAIL, 400)
                }
                if (existingUser.username.toLowerCase() == body.username.toLowerCase()) {
                    const error = new Error("A user with this username already exist");
                    return this.sendErrorResponse(res, error, this.errorResponseMessage.DUPLICATE_USERNAME, 400)
                }
                if (existingUser.phone == body.phone) {
                    const error = new Error("A user with this phone number already exist");
                    return this.sendErrorResponse(res, error, this.errorResponseMessage.DUPLICATE_PHONE, 400)
                }
            }

            next();
        } catch (error: any) {
            console.log(error)
            return this.sendErrorResponse(res, error, this.errorResponseMessage.badRequestError(error.message), 400);
        }
    };

    validatePasswordUpdate = async ( req: Request, res: Response, next: NextFunction ) => {
        try {
            const body = req.body;
            const BodySchema = Joi.object({
                password: Joi.string().required(),
                new_password: Joi.string().required(),
                confirm_password: Joi.string().required()
            });
            
            await BodySchema.validateAsync(body, JoiValidatorOptions);

            next();
        } catch (error: any) {
            return this.sendErrorResponse(res, error, this.errorResponseMessage.badRequestError(error.message), 400);
        }
    };
}

export default AppValidator;