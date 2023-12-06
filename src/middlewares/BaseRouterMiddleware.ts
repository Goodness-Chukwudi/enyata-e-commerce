import UserService from "../services/UserService";
import RequestService from "../services/RequestService";
import BaseResponseHandler from "../controllers/base controllers/BaseResponseHandlerController";
import { NextFunction, Request, Response, Router } from "express";
import Joi from "joi";
import { JoiValidatorOptions } from "../common/configs/app_config";
import { date } from "../common/utils/JoiExtensions";

const JoiDate = Joi.extend(date);

/**
 * An abstract class that provides a base middleware for all routers.
 * Middleware classes that extend this class get access to:
 * - an instance of the following classes: UserService, RequestService class
 * - Other non private members of the BaseResponseHandler class
 * - The express router of the request
 * - an abstract method initServices that needs to be implemented when initializing services
*/
abstract class BaseRouterMiddleware extends BaseResponseHandler {

    public router;
    protected userService: UserService;
    protected requestService: RequestService;


    constructor(appRouter: Router) {
        super();
        this.router = appRouter;
        this.userService = new UserService();
        this.requestService = new RequestService(this.router);
        this.initServices();

    }

    protected abstract initServices():void;

    /**
     * Validates the specified properties on the query object of a http request.
     * The specified properties are
     * - size, a number specifying the number of items per page in a paginated endpoint
     * - page, a number specifying the page number in a paginated endpoint
     * - sort, a boolean specifying if the documents should be sorted by the created_at property
     * - id, a mongo db object Id
     * - ids, a list of mongo db object Ids
     * Returns a 404 with the appropriate error message if validation fails
    */ 
    validateDefaultQueries = async ( req: Request, res: Response, next: NextFunction ) => {
        try {
            const QuerySchema = Joi.object({

                size: Joi.number().min(0),
                page: Joi.number().min(0),
                sort: Joi.object(),
                user_id: Joi.string(),
                id: Joi.string(),
                ids: Joi.array().items(Joi.string()).min(1),
                startDate: JoiDate.date().format("YYYY-MM-DD"),
                endDate: JoiDate.date().format("YYYY-MM-DD")
            });
            const ParamSchema = Joi.object({
                id: Joi.string(),
            });
            //@ts-ignore
            JoiValidatorOptions.allowUnknown = true;
            await QuerySchema.validateAsync(req.query, JoiValidatorOptions);
            await ParamSchema.validateAsync(req.params, JoiValidatorOptions);

            next();
        } catch (error: any) {
            return this.sendErrorResponse(res, error, this.errorResponseMessage.badRequestError(error.message), 400);
        }
    };
    
    /**
     * Validates the specified properties on the params object of a http request.
     * - ids, a list of mongo db object Ids
     * Returns a 404 with the appropriate error message if validation fails
    */ 
    validateDefaultParams = async ( req: Request, res: Response, next: NextFunction ) => {
        try {
            const ParamSchema = Joi.object({
                id: Joi.string().required()
            });
            
            await ParamSchema.validateAsync(req.params, JoiValidatorOptions);
            next();
            
        } catch (error: any) {
            return this.sendErrorResponse(res, error, this.errorResponseMessage.badRequestError(error.message), 400);
        }
    };
}

export default BaseRouterMiddleware;
