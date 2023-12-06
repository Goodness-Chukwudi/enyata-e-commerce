import OrderProduct, { order_product_table } from '../models/order_products';
import DBService from './DBService';

class OrderProductService extends DBService<OrderProduct> {

    constructor() {
        super(order_product_table,);
        
    }

}

export default OrderProductService;
