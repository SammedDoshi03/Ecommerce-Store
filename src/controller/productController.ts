/**
 * Product Controller for product related operations
 */

import products, {IProduct} from "../models/products";
import mongoose from "mongoose";
import Category from "../models/category";

export default  class  productController {


    /**
     * Create a new product
     *
     */
    static async createProduct(product: IProduct): Promise<IProduct> {
        const productDetails = await products.findById(product._id);

        // cheking for the product already exists
        if (productDetails) throw new Error("Product already exists");

        // checking for Selling price and cost price
        if (product.sellPrice < product.costPrice)
            throw new Error("Selling Price cannot be less than Cost Price")
        const newProduct = await products.create(product)

        if (!newProduct) throw new Error("Product not created");
        return newProduct;
    }


    /**
     * Get all products
     * return all products
     */
    public static async getAllProducts(data : any): Promise<IProduct[]> {
        const {page, limit, ...rest} = data;

        if(data.length == 2){
            const productList = await products.find({}).populate('Category').skip(page * limit).limit(limit);
            if (products.length > 0 ) return productList;
            else throw new Error("Products not found");
        }
        else{
            const productList = await products.find({Category: new mongoose.Types.ObjectId(rest["Category"])}).populate('Category').skip(page * limit).limit(limit);
            if (productList.length > 0 ) return productList;
            else throw new Error("Products not found");
        }
    }
}