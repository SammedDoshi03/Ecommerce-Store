/**
 * User Controller for user related operations
 */
import categories, {ICategory} from '../models/category';

export default class categoryController{

    /**
     * @description - This method is used to get all categories
     */
    public static async getAllCategories() : Promise<ICategory[]>{
            const categoryList = await categories.find().lean();
            if(categoryList.length > 0) {
                return categoryList;
            } else {
              throw new Error('No Categories found');
            }
    }
}