/**
 * @info Seller Controller
 */
import sellers, { ISeller } from "../models/sellers";
import products, { IProduct } from "../models/products";
import orders, {IOrder} from "../models/orders";
import mongoose from "mongoose";
import Bcrypt from "../services/bcrypt";

export default class sellerController {

    /**
     * create new seller
     * @param body
     */
    static async create(body: any): Promise<ISeller> {
        const hash = await Bcrypt.hashing(body.password);
        const data = {
            ...body,
            password: hash,
        };
        return sellers.create(data);
    }

    /**
     * authenticate seller
     * @param email
     * @param password
     * @returns Login status
     */
    static async auth(email: string, password: string): Promise<ISeller> {
        //fetch data from database
        const seller = await sellers.findOne({email}).lean()
        //check seller is exists or not
        if (seller) {
            //comparing the password with hash
            const res = await Bcrypt.comparing(password, seller.password);
            //check correct or not
            if (res) return seller;
            else throw new Error("Wrong password")
        } else throw new Error("Seller does not exists");
    }

    /**
     * get all orders
     * @param page
     * @param limit
     * @param sellerId
     * @returns IOrders (seller's orders)
     */
    static async getOrders(page: number, limit: number, sellerId: string): Promise<IOrder[]>{

        //get seller's orders
        return orders.aggregate([
            {
                $match: {Seller: new mongoose.Types.ObjectId(sellerId) }
            },
            {
                $skip: page * limit,
            },
            {
                $limit: limit,
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
                    "User": {
                        "password": 0,
                        "balance":0
                    },
                    "Seller": {
                        "password": 0,
                        "totalRevenue": 0,
                        "noOfOrders": 0,
                        "netProfit": 0,
                    },
                    "Product": {
                        "Seller": 0,
                        "Category": 0
                    }
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]).exec();
    }

    /**
     * get all products
     * @param page
     * @param limit
     * @param sellerId
     * @param stock
     * return inventory list
     */
    static async getInventory(page: number, limit: number, sellerId: string, stock:number): Promise<IProduct[]>{

        //get sellers products
        const sellerProducts = await products.aggregate([
            {
                $match: {
                    Seller: new mongoose.Types.ObjectId(sellerId)
                },
            },
            {
                $skip: page * limit,
            },
            {
                $limit: limit,
            },
            {
                $lookup:{
                    from : "categories",
                    localField: "Category",
                    foreignField: "_id",
                    as: "Category"
                }
            },
            {
                $lookup:{
                    from : "sellers",
                    localField: "Seller",
                    foreignField: "_id",
                    as: "Seller"
                }
            },
            {
                $project: {
                    "Seller.password": 0,
                    "Seller.totalRevenue": 0,
                    "Seller.noOfOrders": 0,
                    "Seller.netProfit": 0,
                    "Seller.Order": 0,
                    "Seller.Product": 0,
                }
            }
        ]).exec();

        let filteredSellerProducts = sellerProducts;

        if(stock === 0) //display in-stock products
        {
            filteredSellerProducts = filteredSellerProducts.filter(product => {
                if (product.aQuantity > 0) {
                    return product;
                }
            })
        }
        if(stock === 1) //display out-of-stock products
        {
            filteredSellerProducts = filteredSellerProducts.filter(product => {
                if (product.aQuantity == 0) {
                    return product;
                }
            })
        }
        return filteredSellerProducts;
    }

    /**
     * Gets seller profile
     *@param sellerId
     *@returns sellerProfile
     */
    static async getSellerProfile(sellerId): Promise<ISeller>{
        //get seller's profile
        const sellerProfile = await sellers.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(sellerId)
                },
            },
            {
                $project: {
                    password: 0,
                },
            }
        ]).exec();

        // if sellerProfile is empty or not
        if (sellerProfile.length > 0) return sellerProfile[0];
        else throw new Error("Seller not found");
    }

    /**
     * Updates seller profile's noOfOrders, totalRevenue and netProfit
     * @param sellerId
     * @param quantity
     * @param sellPrice
     * @param costPrice
     * @returns sellerProfile
     */
    static async updateSellerProfile(quantity, sellPrice, costPrice, sellerId): Promise<void>{
        //get seller's profile

        const seller = await sellers.findById(sellerId).lean();
        //Update noOfOrders, totalRevenue and netProfit parameters
        let order = seller.noOfOrders + 1;
        let revenue = (+quantity * +sellPrice) + seller.totalRevenue;
        let profit = ((+sellPrice - +costPrice) * +quantity) + seller.netProfit;

        await sellers.findByIdAndUpdate(sellerId, {noOfOrders:order, totalRevenue:revenue, netProfit:profit })

    }

}