import express, {Express} from "express";
import cors from "./common/utils/Cors";
import helmet from "helmet";
import compression from "compression"
import AppRoutes from "./routes/AppRoutes";
import AuthController from "./controllers/AuthController";
import AuthMiddleware from "./middlewares/AuthMiddleware";
import fileUpload from "express-fileupload";
import Env from "./common/configs/environment_config";
import UtilityValidator from "./middlewares/validators/UtilityValidator";
import { DEFAULT_API_RESPONSE } from "./common/constants/app_constants";
import { PoolClient } from "pg";

class App {

    public app: Express;
    public dbClient: PoolClient;
    private authMiddleware: AuthMiddleware;
    private utilityValidator: UtilityValidator;

    constructor() {
      this.app = express();
      this.plugInMiddlewares();
      this.plugInRoutes();
    }

    setDbClient(client: PoolClient) {
      this.dbClient = client;
    }

    private plugInMiddlewares() {
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: false }));
      this.app.use(fileUpload({useTempFiles: true, tempFileDir: "/tmp/", limits: { fileSize: 10 * 1024 *1024 /*10mb*/}, abortOnLimit: true}));
      this.app.use(cors());
      this.app.use(helmet());
      this.app.use(compression());

      this.authMiddleware = new AuthMiddleware(this.app);
      this.utilityValidator = new UtilityValidator(this.app);
    }

    private plugInRoutes() {
      const appRoutes = new AppRoutes(this.app);
    
      this.app.get("/", (req, res) => {
        res.status(200).send(DEFAULT_API_RESPONSE);
      });

      this.app.get(Env.API_PATH + "/health", (req, res) => {
        const response = "Server is healthy____   " + new Date().toUTCString();
        res.status(200).send(response);
      });
      
      //load public/non secured routes
      this.app.use(Env.API_PATH, this.utilityValidator.validateDefaultQueries);
      this.app.use(Env.API_PATH + "/auth", AuthController);

      //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      //  ALWAYS PREFIX EACH ENDPOINT WITH THE VALUE OF <API_PATH>
      //  THE AUTH GUARD ONLY WATCHES OUT FOR ENDPOINTS PREFIXED WITH THE VALUE OF <API_PATH>
      
      //  Load Authentication MiddleWare
      this.app.use(Env.API_PATH, this.authMiddleware.authGuard);
      
      //Initialize other routes
      //These routes are protected by the auth guard
      appRoutes.initializeRoutes();

      //return a 404 for unspecified/unmatched routes
      this.app.all("*", (req, res) => {
        
        res.status(404).send("RESOURCE NOT FOUND");
      });
      
    }
}
const appInstance = new App();
export default appInstance.app;
export {appInstance};