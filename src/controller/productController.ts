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
        const productDetails = await products.findOne({ pName: product.pName }).lean();

        // cheking for the product already exists
        if (productDetails) throw new Error("Product already exists");

        // checking for Selling price and cost price
        // if (product.sellPrice < product.costPrice)
        //     throw new Error("Selling Price cannot be less than Cost Price")

        const newProduct = await products.create(product)
        if (!newProduct) throw new Error("Product not created");
        return newProduct;
    }



    /**
     * Get all products
     * @param page
     * @param limit
     * @param filterBy
     * @param sort
     * @returns all products
     */
    static async findAll(page,limit,filterBy,sort,category):Promise<IProduct[]>{
        //check category is empty or not
        if(category !=undefined){
            var sort1 = { $sort: {} }
            // sory by filter and asc and dsc order
            sort1["$sort"][filterBy] = sort
            const result = await products.aggregate([
                {
                    $match: { Category: new mongoose.Types.ObjectId(category) },
                },
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "Category",
                        foreignField: "_id",
                        as: "Category"
                    },
                },
                sort1,
            ])
            return result;
        }
        // if category is not given
        else{

            var sort1 = { $sort: {} }
            sort1["$sort"][filterBy] = sort
            const result = await products.aggregate([
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                sort1,
            ])
            return result;
        }
    }
}