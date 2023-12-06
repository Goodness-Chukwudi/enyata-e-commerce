import {Express} from "express";
import Env from "../common/configs/environment_config";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import AdminController from "../controllers/AdminController";
class AdminRoutes {

    private app: Express;
    constructor(app: Express) {
        this.app = app;
    }

    initializeRoutes() {
        const authMiddleware = new AuthMiddleware(this.app);
        
        const ADMIN_PATH = "/admin";

        this.app.use(Env.API_PATH + ADMIN_PATH, authMiddleware.validateAdminPrivilege);
        this.app.use(Env.API_PATH + ADMIN_PATH, AdminController);
    }
}

export default AdminRoutes;