import {Express} from "express";
import Env from "../common/configs/environment_config";
import AppController from "../controllers/AppController";
class AppRoutes {

    private app: Express;
    constructor(app: Express) {
        this.app = app;
    }

    initializeRoutes() {
        
        this.app.use(Env.API_PATH + "/", AppController);
    }
}

export default AppRoutes;