import BaseRouterMiddleware from "../BaseRouterMiddleware";
import { NextFunction, Request, Response, Router } from "express";
import LoginSessionService from "../../services/LoginSessionService";


export class UtilityValidator extends BaseRouterMiddleware {


    protected loginSessionService: LoginSessionService;

    constructor(appRouter: Router) {
        super(appRouter);
    }

    protected initServices() {
    }
}

export default UtilityValidator;