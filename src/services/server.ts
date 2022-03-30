/**
 * @info the main entry point of express server
 */

import express, {Request, Response} from "express";

import bodyParser from "body-parser";
import responseToPostman from "../middleware/responseToPostman";
import expressLog from "../middleware/expressLog";

import Joi from "joi";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import userController from "../controller/userController";
import productController from "../controller/productController";
import categoryController from "../controller/categoryController";
import adminController from "../controller/adminController";
import sellerController from "../controller/sellerController";
import orderController from "../controller/orderController";


export default class Server {
    app = express();

    async start() {
        console.log("Server started");
        this.app.listen(process.env.PORT);
        console.log("Server listening on port: " + process.env.PORT);

        this.middleware();
        this.routes();
        this.defRoutes();
    }

    /**
     * @info middleware
     */
    middleware() {
        this.app.use(morgan("combined"));
        this.app.use(expressLog);
        this.app.use(bodyParser.urlencoded({ extended: false }));

        this.app.use(
            session({
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
                store: new MongoStore({
                    mongoUrl: process.env.SESSION_MONGODB_URL,
                    collectionName: "sessions",
                }),
                cookie: {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                },
            }),
        );
        // adminController.create();
    }

    /**
     * @info define routes
     */

    routes() {
        this.app.get("/", (req: Request, res: Response) => {
            console.log("GET /");
            res.send("Welcome to Ecommerce Store");
        });


        /**
         * @info Admin routes
         */

        /**
         * Admin login
         * @param {string} email
         * @param {string} password
         * @returns {string}
         */
        this.app.post(
            "/admin/login",
            responseToPostman( async  (req: Request, res: Response) => {
                const schema = Joi.object().keys({
                    email: Joi.string().email().required(),
                    password: Joi.string().required(),
                });
                const data = await schema.validate(req.body);
                const admin = await adminController.adminAuth(data.value.email, data.value.password);
                if (admin) {
                    // @ts-ignore
                    req.session.admin = admin;
                    res.send("Admin Authenticated");
                } else {
                    throw new Error("Invalid email or password");
                }
            },
        ));

        /**
         * Admin logout
         */
        this.app.get(
            "/admin/logout",
            responseToPostman( async (req: Request, res: Response) => {
                // @ts-ignore
                req.session.admin = null;
                res.send("Admin logged out");
            },
        ));

        /**
         * Create Seller
         * @param {string} name
         * @param {string} email
         * @param {string} password
         */
        this.app.post(
            "/admin/seller/create",
            responseToPostman( async (req: Request, res: Response) => {
                const schema = Joi.object().keys({
                    name: Joi.string().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().required(),
                });
                const data = await schema.validate(req.body);
                const seller = await adminController.addSeller(data.value);
                res.send(seller);
            },
        ));

        /**
         * Create Category
         * @param {string} name
         */
        this.app.post(
            "/admin/category/create",
            responseToPostman( async (req: Request, res: Response) => {
                const schema = Joi.object().keys({
                    name: Joi.string().required(),
                });
                const data = await schema.validate(req.body);
                const category = await adminController.addCategory(data.value);
                res.send(category);
            },
        ));

        // Seller

        /**
         * Create Seller
         */
        this.app.post(
            "/admin/addSeller",
            responseToPostman(async (req: Request) => {

                // @ts-ignore
                if (req.session && req.session.admin) {

                //joi schema for creating seller
                const schema = Joi.object({
                    name: Joi.string().min(5).required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().min(8).required(),
                });

                // validating req.body
                await schema.validateAsync(req.body);

                // creating seller
                const seller =  await sellerController.create(req.body);

                if(seller) return "Seller created";
                else throw new Error("Seller is not created");
                }
                else throw new Error("You are not authorized to perform this action");
            })
        );


        /**
         * Logging out admin or seller or user
         */
        this.app.post(
            "/logout",
            responseToPostman((req: Request) => {
                // destroy session
                req.session.destroy(() => {});

                // return success to admin/seller/user
                return { success: true, message: "User/Admin/seller has logged out" };
            }),
        );

        /**
         * Seller Authorization
         */

        this.app.post(
            "/seller/auth",
            responseToPostman(async (req: Request) => {
                // create joi schema for email and password
                const schema = Joi.object({
                    email: Joi.string().email().required(),
                    password: Joi.string().min(8).required(),
                });

                // validating req.body
                await schema.validateAsync(req.body);

                // authenticate seller
                const seller = await sellerController.auth(req.body.email, req.body.password);
                if(seller) {
                    // set the seller session
                    // @ts-ignore
                    req.session.seller = seller;
                    return "Seller authenticated successfully";
                }
                else throw new Error("Seller is not authenticated");
            }),
        );

        /**
         * Get seller's orders
         */

        this.app.get(
            "/seller/orders",
            responseToPostman(async (req: Request) => {
                //@ts-ignore
                if(req.session && req.session.seller)
                {
                    //get page and limit
                    const schema = Joi.object({
                        page: Joi.number().integer().default(0),
                        limit: Joi.number().integer().default(5),
                    });

                    // validate
                    const data = await schema.validateAsync(req.query);

                    // find all orders
                    // @ts-ignore
                    const orders = await sellerController.getOrders(data.page, data.limit, req.session.seller._id);
                    if(orders.length > 0)
                        return(orders);
                    else return("No Orders received yet")
                }
                else  throw new Error("Seller is not authenticated");
            }),
        );

        /**
         * Get seller's inventory
         */

        this.app.get(
            "/seller/inventory",
            responseToPostman(async (req: Request) => {
                //@ts-ignore
                if(req.session && req.session.seller)
                {
                    //get page and limit
                    const schema = Joi.object({
                        page: Joi.number().integer().default(0),
                        limit: Joi.number().integer().default(5),
                        stock: Joi.string().regex(/^[0-1]$/)
                    });

                    // validate
                    const data = await schema.validateAsync(req.query);

                    // find inventory products
                    // @ts-ignore
                    const inventory= await sellerController.getInventory(data.page, data.limit, req.session.seller._id, +data.stock);
                    if (inventory.length > 0)
                        return inventory;
                    else return ("Seller doesn't have any products")
                }
                else throw new Error("Seller is not authenticated");
            }),
        );

        /**
         * Get seller's profile
         */

        this.app.get(
                "/seller/profile",
            responseToPostman(async (req: Request) => {
                //@ts-ignore
                if(req.session && req.session.seller)
                {
                    // find inventory products
                    // @ts-ignore
                    return sellerController.getSellerProfile(req.session.seller._id);
                }
                else {
                    throw new Error("Seller is not authenticated");
                }
            }),
        );

        // User
        /**
         * Create a new user
         * @param {string} name
         * @param {string} email
         * @param {string} password
         * @param {number} balance
         * @return "User created"
         */
        this.app.post("/users/create", responseToPostman(async (req: Request, res: Response) => {
            const schema = Joi.object().keys({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(8).required(),
                balance: Joi.number().required(),
            });

            const result = await schema.validate(req.body);
            const user = await userController.create(result.value);
            if (user === null) {
                res.status(400).send(result.error);
            } else {
                res.send("User created");
            }
        }));

        /**
         * Login a user
         * @param {string} email
         * @param {string} password
         * @return {string} "User logged in"
         */
        this.app.post("/users/login", responseToPostman(async (req: Request, res: Response) => {
            const schema = Joi.object().keys({
                email: Joi.string().email().required(),
                password: Joi.string().min(8).required(),
            });
            const result = await schema.validate(req.body);
            const user = await userController.auth(result.value.email, result.value.password);

            if (user === null) {
                res.status(400).send(result.error);
            } else {
                //Store user in session
                // @ts-ignore
                req.session.user = user;
                res.send("User logged in");
            }
        }));

        /**
         * Added Balance to user
         * @return {string} "User logged out"
         */
        this.app.post("/users/addBalance", responseToPostman(async (req: Request, res: Response) => {
            const schema = Joi.object().keys({
                balance: Joi.number().min(1).required(),
            });
            // @ts-ignore
            if(req.session && req.session.user){
            const result = await schema.validate(req.body);
                // @ts-ignore
            const user = await userController.addBalance(req.session.user._id, result.value.balance);
            if (user === null) {
                throw new Error("User is not authenticated");
            } else {
                res.send("Wallet updated");
            }}
            else throw new Error("User is not authenticated");
        }));

        /**
         * Logout a user
         * @return {string} "User logged out"
         */
        this.app.post("/users/logout", responseToPostman(async (req: Request, res: Response) => {
            // @ts-ignore
            req.session.destroy();
            res.send("User logged out");
        }));

        /**
         * Place an Order
         * @param {string} userId
         * @param {string} productId
         * @param {number} requiredQuantity
         * @return {string} "Order placed"
         */
        this.app.post("/order/place", responseToPostman(async (req: Request, res: Response) => {
            const schema = Joi.object().keys({
                product: Joi.string().required(),
                requiredQuantity: Joi.number().required(),
                date: Joi.date().default(new Date()),
            });
            const result = await schema.validate(req.body);
            // @ts-ignore
            const user = req.session.user;
            if (user === null) {
                res.status(500).send("User need to login to place an order");
            } else {
                const orderData = {
                    User: user._id,
                    Product: result.value.product,
                    requiredQuantity: result.value.requiredQuantity,
                    createdAt: result.value.date,
                }
                const order = await orderController.placeOrder(user._id, result.value.product, orderData);
                if (order === null) {
                    res.status(400).send(result.error);
                } else {
                    res.send("Order placed");
                }
            }
        }));

        /**
         * Get all orders of a user
         */
        this.app.get("/orders/", responseToPostman(async (req: Request) => {
            // @ts-ignore
            const user = req.session.user;
            if (user === null) {
                throw new Error("User need to login to get orders");
            } else {
               return await orderController.getOrders(user._id);
            }
        }));

        /**
         * Product Routes
         */
        /**
         * Create a product
         * @param {string} name
         * @param {number} Description
         * @param {number} Quantity
         * @param {number} SellingPrice
         * @param {number} CostPrice
         * @return {string} "Product created"
         */
        this.app.post("/product/create", responseToPostman(async (req: Request) => {
            // @ts-ignore
            if(req.session && req.session.seller)
            {
            const schema = Joi.object().keys({
                pName: Joi.string().required(),
                pDescription: Joi.string().required(),
                aQuantity: Joi.number().required(),
                sellPrice: Joi.number().required(),
                costPrice: Joi.number().required(),
                createdAt: Joi.date().default(new Date()),
                Category: Joi.string().required(),
            });
                const data = {
                    ...req.body,
                    //@ts-ignore
                    Seller: req.session.seller._id,
                }
            const result = await schema.validate(data);
                return await productController.createProduct(result.value);
            }
            else{
               throw new Error("You are not authorized to perform this action");
            }
        }));


        /**
         * Get Product List
         *  Filtering by Category [if Provided]
         *  Sorting by Price and Date [if Provided]
         * @return "Product List"
         */
        this.app.get("/products/", responseToPostman(async (req: Request) => {
            // joi validation
            const schema = Joi.object().keys({
                page: Joi.number().integer().default(0),
                limit: Joi.number().integer().default(10),
                category: Joi.string().optional(),
                sort: Joi.string().optional(),
                sortBy: Joi.string().optional(),
                sortOrder: Joi.string().optional(),
            });

            const result = await schema.validate(req.body);
            return await productController.getAllProducts(result.value);
        }));

        /**
         * Get Category List
         * @return "Category List"
         */
        this.app.get("/categories/", responseToPostman(async () => {
            return await categoryController.getAllCategories();
        }));
    }

    /**
     * @info define the default routes
     */

    defRoutes() {
        // check if server running
        this.app.all("/", (req, resp) => {
            resp.status(200).send({ success: true, message: "Server is working" });
        });

        this.app.all("*", (req, resp) => {
            resp.status(404).send({ success: false, message: `given route [${req.method}] ${req.path} not found` });
        });
    }
}
