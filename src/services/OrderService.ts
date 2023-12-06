import { PoolClient } from 'pg';
import Order, { order_table } from '../models/order';
import Product, { product_table } from '../models/product';
import DBService from './DBService';
import AppUtils from '../common/utils/AppUtils';

class OrderService extends DBService<Order> {
    appUtils = new AppUtils;

    constructor() {
        super(order_table);
    }

    processOrders (products:Product[], itemsObject: Record<string, any>, userId:number, transaction:PoolClient): Promise<Record<string, any>> {

        return new Promise(async (resolve, reject) => {
                try {
                    
                    this.appUtils = new AppUtils();
                
                    const orderProducts:any[] = [];
                    const orderCode = this.appUtils.generateUUIDV4();
                    let orderAmount = 0;
                    let queryString = "";
                    const queryIdList:number[] = [];
                
                    products.forEach((product, i) => {
                        const orderProduct = {
                            name: product.name,
                            price: product.price,
                            quantity: itemsObject[product.id!],
                            order_code: orderCode,
                            product_id: product.id,
                            customer_id: userId
                        };
                        orderProducts.push(orderProduct);
                
                        orderAmount += orderProduct.price * orderProduct.quantity;
                
                        const remainingQty = product.available_quantity - orderProduct.quantity;
                        queryString += `
                            WHEN id = ${product.id} THEN ${remainingQty}
                        `;
                        queryIdList.push(product.id!);
                    })
                
                    queryString = `
                        UPDATE ${product_table}
                            SET available_quantity = (CASE
                                ${queryString}
                        END)
                        WHERE id IN (${queryIdList.join()})
                        RETURNING *
                    `;
                    
                    await transaction.query(queryString);            
                    resolve({orderCode, orderAmount, orderProducts});
                } catch (error) {
                    reject(error);
                }

        })
    }
}


export default OrderService;
