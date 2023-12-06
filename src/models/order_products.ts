import Order from "./order";
import Product from "./product";
import User from "./user";

interface OrderProduct {
    id?: number,
    name: string,
    price: number,
    quantity: number,
    order_code: number|Order,
    product_id: number|Product,
    customer_id: number|User,
    created_at: Date
}

export const order_product_table = "order_products";
export default OrderProduct;