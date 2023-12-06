import User from "./user";

interface Order {
    id?: number,
    code: string,
    customer_name: string,
    customer_id: number|User,
    amount: number,
    status: string,
    created_at: Date
}

export const order_table = "orders";
export default Order;