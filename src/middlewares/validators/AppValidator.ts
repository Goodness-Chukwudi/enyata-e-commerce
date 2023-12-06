import { NextFunction, Request, Response, Router } from "express";
import Joi from "joi";
import BaseRouterMiddleware from "../BaseRouterMiddleware";
import { JoiValidatorOptions } from "../../common/configs/app_config";
import { GENDER } from "../../common/constants/app_constants";
import ProductService from "../../services/ProductService";

class AppValidator extends BaseRouterMiddleware {

    productService: ProductService;

    constructor(appRouter: Router) {
        super(appRouter);
    }

    protected initServices(): void {
        this.productService = new ProductService();
    }

    validateSignup = async ( req: Request, res: Response, next: NextFunction ) => {
        try {
            const body = req.body;

            const BodySchema = Joi.object({
                first_name: Joi.string().required(),
                last_name: Joi.string().required(),
                middle_name: Joi.string(),
                email: Joi.string().email().lowercase().required(),
                phone: Joi.string().required(),
                gender: Joi.string().valid(...Object.values(GENDER)).required(),
                new_password: Joi.string().min(8).required(),
                confirm_password: Joi.string().required()
            });
            
            await BodySchema.validateAsync(req.body, JoiValidatorOptions);

            const query = {
                condition: "email=$1 OR phone=$2",
                values: [body.email, body.phone]
            }

            const existingUser = await this.userService.findOne(query, "id, email, phone");
            if(existingUser) {
                if (existingUser.email == body.email) {
                    const error = new Error("A user with this email already exist");
                    return this.sendErrorResponse(res, error, this.errorResponseMessage.DUPLICATE_EMAIL, 400)
                }
                if (existingUser.phone == body.phone) {
                    const error = new Error("A user with this phone number already exist");
                    return this.sendErrorResponse(res, error, this.errorResponseMessage.DUPLICATE_PHONE, 400)
                }
            }

            next();
        } catch (error: any) {
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

    validateNewProduct = async ( req: Request, res: Response, next: NextFunction ) => {
        try {
            const BodySchema = Joi.object({
                name: Joi.string().max(100).required(),
                price: Joi.number().min(0).required(),
                description: Joi.string().max(250),
                available_quantity: Joi.number().integer().min(0).required()
            });
            
            await BodySchema.validateAsync(req.body, JoiValidatorOptions);

            const query = {
                condition: "name=$1",
                values: [req.body.name]
            }

            const existingProduct = await this.productService.findOne(query);
            if(existingProduct) {
                const error = new Error("A product with this name already exist");
                return this.sendErrorResponse(res, error, this.errorResponseMessage.duplicateValue("Product name"), 400);
            }

            next();
        } catch (error: any) {
            return this.sendErrorResponse(res, error, this.errorResponseMessage.badRequestError(error.message), 400);
        }
    };
}

export default AppValidator;