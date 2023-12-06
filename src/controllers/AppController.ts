import { BIT, LOGIN_SESSION_VALIDITY, PASSWORD_STATUS, USER_PASSWORD_LABEL } from "../common/constants/app_constants";
import AppValidator from "../middlewares/validators/AppValidator";
import UserPassword from "../models/user_password";
import LoginSessionService from "../services/LoginSessionService";
import OrderProductService from "../services/OrderProductService";
import OrderService from "../services/OrderService";
import PasswordService from "../services/PasswordService";
import ProductService from "../services/ProductService";
import UserService from "../services/UserService";
import BaseApiController from "./base controllers/BaseApiController";



class AppController extends BaseApiController {

    userService: UserService;
    loginSessionService: LoginSessionService;
    passwordService: PasswordService;
    productService: ProductService;
    orderProductService: OrderProductService;
    orderService: OrderService;
    appValidator: AppValidator;

    constructor() {
        super();
    }

    protected initializeServices() {
        this.userService = new UserService();
        this.loginSessionService = new LoginSessionService();
        this.passwordService = new PasswordService();
        this.productService = new ProductService();
        this.orderProductService = new OrderProductService();
        this.orderService = new OrderService();
    }
    
    protected initializeMiddleware() {
        this.appValidator = new AppValidator(this.router);
    }

    protected initializeRoutes() {
        this.me("/me"); //GET
        this.logout("/logout"); //PATCH
        this.updatePassword("/password"); //PATCH
        this.listProducts("/products"); //GET
        this.createOrder("/orders"); //POST
        this.listOrders("/orders"); //GET
    }

    me(path:string) {
        //returns the logged in user
        this.router.get(path, (req, res) => {
            const user = this.requestService.getLoggedInUser();
            this.sendSuccessResponse(res, user);
        })
    }


    logout(path:string) {
        this.router.patch(path, async (req, res) => {
            try {
                const activeLoginSession = this.requestService.getLoginSession();
    
                const query = {
                    condition: "id=$1",
                    values: [activeLoginSession.id]
                }
                const update:Record<string, any> = {}
                
                if (activeLoginSession.validity_end_date > new Date()) {
                    update.logged_out = true;
                    update.validity_end_date = new Date();
                } else {
                    update.expired = true
                }
                update.status = BIT.OFF;
                await this.loginSessionService.updateOne(query, update);

                this.sendSuccessResponse(res);
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
            }
        });
    }


    updatePassword(path:string) {
        this.router.patch(path,
            this.appValidator.validatePasswordUpdate,
            this.userMiddleWare.validatePassword,
            this.userMiddleWare.hashNewPassword
        );

        this.router.patch(path, async (req, res, next) => {
            const transaction = await this.appUtils.startDbTransaction();
            try {
                const loggedInUser = this.requestService.getLoggedInUser();
                const previousPassword:UserPassword = this.requestService.getDataFromState(USER_PASSWORD_LABEL);

                const passwordData = {
                    password: req.body.password,
                    email: loggedInUser.email,
                    user_id: loggedInUser.id!
                }
                await this.passwordService.save(passwordData, transaction);
                //Deactivate old password
                const query = {
                    condition: "id=$1",
                    values: [previousPassword.id]
                }
                await this.passwordService.updateOne(query, {status: PASSWORD_STATUS.DEACTIVATED});

                await this.appUtils.commitDbTransaction(transaction);
                next();
            } catch (error:any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500, transaction) 
            }
        });

        this.router.patch(path, this.userMiddleWare.logoutExistingSession);
        this.router.patch(path, async (req, res) => {
            try {
                const user = this.requestService.getLoggedInUser();
    
                const loginSessionData = {
                    user_id: user.id!,
                    status: BIT.ON,
                    validity_end_date: new Date(Date.now() + LOGIN_SESSION_VALIDITY)
                };
                const loginSession = await this.loginSessionService.save(loginSessionData);
                const token = this.appUtils.createAuthToken(user.id!, loginSession.id!);
                const response = {
                    message: this.successResponseMessage.PASSWORD_UPDATE_SUCCESSFUL,
                    token: token
                }
        
                this.sendSuccessResponse(res, response);                
            } catch (error: any) {
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
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
                let size;
                if (req.query.size) size = Number(req.query.size);

                let page;
                if (req.query.page) page = Number(req.query.page);

                const products = await this.productService.find(query, "*", "", "", "", size, page);
                
                return this.sendSuccessResponse(res, products);
            } catch (error:any) {
                return this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500)
            }
        });
    }

    createOrder(path:string) {
        this.router.post(path, this.appValidator.validateOrder);
        this.router.post(path, async (req, res) => {

            const transaction = await this.appUtils.startDbTransaction();
            try {
                const user = this.requestService.getLoggedInUser();
                const itemsObject:Record<string, any> = {};

                const params:string[] = [];

                req.body.items.forEach((item: any, i:number) => {
                    itemsObject[item.product]  = item.quantity;
                    const count = i+1;
                    params.push("$"+count);
                })

                //Fetch products with their IDs
                const productIds = Object.keys(itemsObject);

                const query = {
                    condition: `id IN (${params.join()})`,
                    values: productIds
                }
                const products = await this.productService.find(query, "*", "", "", "", 0, 0, transaction);
                const {orderCode, orderAmount, orderProducts} = await this.orderService.processOrders(products, itemsObject, user.id!, transaction);
                
                const orderData = {
                    customer_name: user.first_name +" "+ user.last_name,
                    customer_id: user.id,
                    code: orderCode,
                    amount: orderAmount
                }


                await this.orderService.save(orderData, transaction);
                await this.orderProductService.saveMany(orderProducts, transaction);

                this.appUtils.commitDbTransaction(transaction);
                this.sendSuccessResponse(res);
            } catch (error: any) {
                this.appUtils.rollBackDbTransaction(transaction);
                this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
            }
        });
    }

    listOrders(path:string) {
        this.router.get(path, async (req, res) => {
            try {

                let query;
                
                if (req.query.startAmount && req.query.endAmount) {
                    query = {
                        condition: "amount BETWEEN $1 AND $2",
                        values: [req.query.startAmount, req.query.endAmount]
                    }
                }

                let page = 1;
                if (req.query.page) page = Number(req.query.page);

                const reqSort:any = req.query.sort
                const sort =  this.appUtils.convertToBoolean(reqSort) ? "ORDER BY amount ASC" : "ORDER BY amount DESC";

                const orders = await this.orderService.find(query, "*", "", "", sort, 5, page);
                
                return this.sendSuccessResponse(res, orders);
            } catch (error:any) {
                return this.sendErrorResponse(res, error, this.errorResponseMessage.UNABLE_TO_COMPLETE_REQUEST, 500)
            }
        });
    }
}

export default new AppController().router;