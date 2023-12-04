import express from 'express';
import AppUtils from '../../common/utils/AppUtils'
import UserMiddleware from "../../middlewares/UserMiddleware";
import UserService from "../../services/UserService";
import BaseResponseHandler from './BaseResponseHandlerController';
import RequestService from '../../services/RequestService';

/**
 * An abstract class that provides a base controller for all API controllers.
 * Controllers that extends this class get access to:
 * - an instance of the following classes: AppUtils, UserService, RequestService, UserMiddleware class
 * - Other non private members of the BaseResponseHandler class
 * - The express router of the request
 * - an abstract method initServices that needs to be implemented when initializing services
 * - an abstract method initializeMiddleware that needs to be implemented when initializing middlewares
 * - an abstract method initializeRoutes that needs to be implemented when initializing routes
*/
abstract class BaseApiController extends BaseResponseHandler {

    router;
    protected appUtils: AppUtils;
    protected userService: UserService;
    protected userMiddleWare: UserMiddleware;
    protected requestService: RequestService;


    constructor() {
        super();
        this.router = express.Router();
        this.appUtils = new AppUtils();
        this.userService = new UserService();
        this.userMiddleWare = new UserMiddleware(this.router);
        this.requestService = new RequestService(this.router);
        this.initializeServices();
        this.initializeMiddleware();
        this.initializeRoutes();
    }
    protected abstract initializeServices():void;
    protected abstract initializeMiddleware():void;
    protected abstract initializeRoutes():void;
}

export default BaseApiController;
