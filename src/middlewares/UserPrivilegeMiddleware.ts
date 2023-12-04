import { Request, Response, Router } from "express";
import { ITEM_STATUS, USER_ROLES } from "../common/constants/app_constants";
import UserPrivilegeService from "../services/UserPrivilege.service";
import BaseRouterMiddleware from "./BaseRouterMiddleware";

export class UserPrivilegeMiddleware extends BaseRouterMiddleware {
    private userPrivilegeService: UserPrivilegeService;

    userRoles: string[];
    constructor(appRouter: Router, privileges: string[] = []) {
        super(appRouter);
        this.userRoles = privileges;
    }

    protected initServices() {
        this.userPrivilegeService = new UserPrivilegeService();
    }
    
    public validatePrivileges = (req: Request, res: Response, next: any) => {
        const user = this.requestService.getLoggedInUser();

        const query = {user: user._id, role: {$in: this.userRoles}, status: ITEM_STATUS.ACTIVE}
        this.userPrivilegeService.findOne(query)
        .then((userPrivilege) => {

            if (userPrivilege && userPrivilege._id) {
                    next();
                } else {
                    const error = new Error("Invalid permission. Only "+ this.userRoles.toString() + " is allowed")
                    this.sendErrorResponse(res, error, this.errorResponseMessage.INVALID_PERMISSION, 403)
                }
            })
            .catch((err) => {
                this.sendErrorResponse(res, err, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500)
            })
    }

    public validateSuperAdminPrivilege = (req: Request, res: Response, next: any) => {
        const user = this.requestService.getLoggedInUser();
        const query = {user: user._id, role: {$in: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]}, status: ITEM_STATUS.ACTIVE}
        this.userPrivilegeService.findOne(query)
            .then((userPrivilege) => {
                if (userPrivilege && userPrivilege._id) {
                    next();
                } else {
                    const error = new Error("Invalid permission. Only super admin is allowed");
                    this.sendErrorResponse(res, error, this.errorResponseMessage.INVALID_PERMISSION, 403)
                }
            })
            .catch((err) => {
                this.sendErrorResponse(res, err, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500)
            })
    }
}

export default UserPrivilegeMiddleware;
