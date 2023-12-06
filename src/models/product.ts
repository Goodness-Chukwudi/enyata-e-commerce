
interface Product {
    id?: number,
    name: string,
    price: number,
    description: string,
    available_quantity: number,
    status: string,
    created_by: string,
    created_at: Date
}

export const product_table = "products";
export default Product;