/**
 * order Controller for order related operations
 */

import orders, { IOrder } from "../models/orders";
import products, {IProduct} from "../models/products";
import users from "../models/users";
import mongoose from "mongoose";

export default class orderController{
    /**
     * Place an order for a user
     * @param userId
     * @param order
     * @returns order
     */
    static async placeOrder(userId:string,product : IProduct, order:any): Promise<IOrder> {
        const user = await users.findById(userId).lean();
        const productDetails = await products.findById(product).lean();

        //check product is exists or not
        if(productDetails == null) throw new Error("Product not found");

        // checking for product availability
        if(productDetails.aQuantity < order.requiredQuantity) throw new Error("No of Product not available");

        //check user is exists or not
        if (user !== null){

            //check for balance in user account
            if (user.balance >= (productDetails.sellPrice* order.requiredQuantity)) {

                //deduct the balance from user account
                const newBalance = user.balance - (productDetails.sellPrice * order.requiredQuantity);

                //update the balance in user account
                await users.findByIdAndUpdate(userId, {balance: newBalance});

                // update the product quantity
                const newQuantity = productDetails.aQuantity - order.requiredQuantity;
                await products.findByIdAndUpdate(product, {aQuantity: newQuantity});

                //create an order
                const newOrder = {
                    User: userId,
                    Seller: productDetails.Seller,
                    Product: productDetails._id,
                    requiredQuantity: order.requiredQuantity,
                    createdAt: new Date()
                };

                const finalOrder =  await orders.create(newOrder);

                //return the order
                if(finalOrder) return finalOrder;

                else throw new Error("Order not placed");
            } else throw new Error("Insufficient balance");
        } else throw new Error("user not exists");
    }

    /**
     * Get all orders of a user
     * @param userId
     * @returns orders
     */

    static async getOrders(_id) : Promise<IOrder[]> {

        const user = await users.findById(_id).lean();
        if(user) {
            const orderPlaced = await orders.aggregate([
                {
                    $match: { User: new mongoose.Types.ObjectId(_id) },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "User",
                        foreignField: "_id",
                        as: "User"
                    }
                },
                {
                    $lookup: {
                        from: "sellers",
                        localField: "Seller",
                        foreignField: "_id",
                        as: "Seller"
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "Product",
                        foreignField: "_id",
                        as: "Product"
                    }
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "Product.Category",
                        foreignField: "_id",
                        as: "Category"
                    }
                },
                {
                    $project: {
                        "User.password": 0,
                        "Seller": {
                            "password": 0,
                            "totalRevenue": 0,
                            "noOfOrders": 0,
                            "netProfit": 0,
                        },
                        "Product": {
                            "costPrice" : 0,
                            "aQuantity": 0,
                            "Seller":0,
                            "Category":0
                        }
                    }
                }, {
                $sort: { createdAt: -1 }
                }
            ]).exec();
            if(orderPlaced.length > 0) return orderPlaced;
            else throw new Error("No orders found");
        }
        else throw new Error("user not exists");
    }

}