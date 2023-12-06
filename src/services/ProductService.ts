import DBService from './DBService';
import Product, { product_table } from '../models/product';

class ProductService extends DBService<Product> {

    constructor() {
        super(product_table);
    }
}

export default ProductService;
