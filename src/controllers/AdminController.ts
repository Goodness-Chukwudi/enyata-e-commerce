import AppValidator from "../middlewares/validators/AppValidator";
import ProductService from "../services/ProductService";
import BaseApiController from "./base controllers/BaseApiController";



class AdminController extends BaseApiController {

    productService: ProductService;
    appValidator: AppValidator;

    constructor() {
        super();
    }

    protected initializeServices() {
        this.productService = new ProductService();
    }
    
    protected initializeMiddleware() {
        this.appValidator = new AppValidator(this.router);
    }

    protected initializeRoutes() {
        this.createNewProduct("/products"); //POST
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
                await this.productService.save(productData);

                this.sendSuccessResponse(res, 201);
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
            }
        });
    }
}

export default new AdminController().router;