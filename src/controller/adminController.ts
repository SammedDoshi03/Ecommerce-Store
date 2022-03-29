/**
 * User Controller for user related operations
 */

import admins, {IAdmin} from "../models/admin";
import sellers, {ISeller} from "../models/sellers";
import categories, {ICategory} from "../models/category";
import Bcrypt from "../services/bcrypt";

export default class adminController {

    /**
     * creating a new admin
     */
    static async create(): Promise<void> {
        const email = "admin2@gmail.com";
        const pwd = "admin123"
        const hash = await Bcrypt.hashing(pwd);
        const data = {
            email: email,
            password: hash,
        };
        const auth = await admins.create(data);
        console.log(auth);
    }

    /**
     * authenticating an admin
     * @param email
     * @param password
     */
    static async adminAuth(email: string, password: string): Promise<IAdmin> {
        // fetch admin from database
        const adm = await admins.findOne({ email }).lean();

        // if admin exists or not
        if (adm) {
            // verify the password
            const result = await Bcrypt.comparing(password, adm.password);

            // if password is correct or not
            // if correct, return the admin
            if (result) return adm;
            // throw error
            else throw new Error("Password doesn't match");
        }
        // throw error
        else throw new Error("Admin doesn't exist");
    }

    /**
     * creating a new seller
     * @param seller
     */

    static async addSeller(seller: ISeller): Promise<ISeller> {
        // check if seller exists
        const check = await sellers.findOne({ email: seller.email }).lean();
        if (check) throw new Error("Seller already exists");
        const selllerUser =  await sellers.create(seller);
        if (selllerUser) return selllerUser;
        else throw new Error("Seller not added");
    }

    /**
     * creating a new category
     * @param category
     */

    static async addCategory(category: ICategory): Promise<ICategory> {
        // check if category already exists
        const categoryData = await categories.findOne({ name: category.name }).lean();
        if (categoryData) throw new Error("Category already exists");
        const cat = await categories.create(category);
        if (cat) return cat;
        else throw new Error("Category not added");
    }
}