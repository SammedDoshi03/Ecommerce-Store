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

        const productDetails = await products.findOne({ pName: product.pName, Seller : product.Seller }).lean();

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
            return  await products.aggregate([
                {
                    $match: { Category: new mongoose.Types.ObjectId(category),
                        aQuantity:{$gt:0}
                    },
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
                {
                    $lookup: {
                        from: "sellers",
                        localField: "Seller",
                        foreignField: "_id",
                        as: "Seller"
                    },
                },
                {
                    $project:{"Seller.password":0, "Seller.noOfOrders":0,"costPrice":0,"Seller.totalRevenue":0,
                        "Seller.netProfit":0}
                },

                sort1,
            ]).exec();
        }
        // if category is not given
        else{

            var sort1 = { $sort: {} }
            sort1["$sort"][filterBy] = sort
            return await products.aggregate([
                {
                    $match: {aQuantity:{$gt:0}
                    },
                },
                {
                    $skip: page * limit,
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "Category",
                        foreignField: "_id",
                        as: "Category"
                    },
                },

                {
                    $lookup: {
                        from: "sellers",
                        localField: "Seller",
                        foreignField: "_id",
                        as: "Seller"
                    },
                },
                {
                    $project:{"Seller.password":0, "Seller.noOfOrders":0,"costPrice":0,"Seller.totalRevenue":0,
                        "Seller.netProfit":0}
                },

                {
                    $limit: limit,
                },
                sort1,
            ]).exec()
        }
    }
}