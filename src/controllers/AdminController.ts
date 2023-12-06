import { BIT, LOGIN_SESSION_VALIDITY, PASSWORD_STATUS, USER_PASSWORD_LABEL } from "../common/constants/app_constants";
import AppValidator from "../middlewares/validators/AppValidator";
import UserPassword from "../models/user_password";
import LoginSessionService from "../services/LoginSessionService";
import PasswordService from "../services/PasswordService";
import ProductService from "../services/ProductService";
import UserService from "../services/UserService";
import BaseApiController from "./base controllers/BaseApiController";



class AppController extends BaseApiController {

    userService: UserService;
    loginSessionService: LoginSessionService;
    passwordService: PasswordService;
    productService: ProductService;
    appValidator: AppValidator;

    constructor() {
        super();
    }

    protected initializeServices() {
        this.userService = new UserService();
        this.loginSessionService = new LoginSessionService();
        this.passwordService = new PasswordService();
        this.productService = new ProductService();
    }
    
    protected initializeMiddleware() {
        this.appValidator = new AppValidator(this.router);
    }

    protected initializeRoutes() {
        this.createNewProduct("/"); //POST
        this.listProducts("/"); //GET
    }

    createNewProduct(path:string) {
        this.router.post(path, this.appValidator.validateNewProduct);
        this.router.post(path, async (req, res) => {

            try {
                const user = this.requestService.getLoggedInUser();
                const body = req.body;

                const productData = {
                    name: body.name,
                    price: body.price,
                    description: body.description,
                    available_quantity: body.available_quantity,
                    created_by: user.id
                }
                const product = await this.productService.save(productData);
                console.log(product)

                this.sendSuccessResponse(res, 201);
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500, session);
            }
        });
    }


    listProducts(path:string) {
        this.router.get(path, async (req, res) => {
            try {

                let query;
                
                if (req.query.name) {
                    query = {
                        condition: "name=$1",
                        values: [req.query.name]
                    }
                }
                const size = Number(req.query.size);
                const page = Number(req.query.page);

                const products = await this.productService.find(query, "*", "", "", "", size, page);
                
                return this.sendSuccessResponse(res, products);
            } catch (error:any) {
                return this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500)
            }
        });
    }
}

export default new AppController().router;