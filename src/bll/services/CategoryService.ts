import Category from "../../entities/Category";
import FileRepository from "../../dal/repositories/FileRepository";
import BaseService from "./BaseService";
import {CategoryAlreadyExistsException} from "../errors/CategoryErrors";

class CategoryService extends BaseService<Category> {

    constructor() {
        super(new FileRepository<Category>(Category.fileName));
    }

    async insert(
        name: string,
        description?: string,
    ): Promise<Category> {
        const newCategory = new Category(
            name,
            description,
        )

        if (await this.checkIfExistsByName(name)) {
            throw new CategoryAlreadyExistsException(name);
        }

        await this.repo.insert(newCategory)
        return newCategory;
    }

    async updateName(id: string, newName: string): Promise<boolean> {
        const target = await this.getById(id);

        if (!target) return false

        target.name = newName;

        return await this.update(target);
    }

    async updateDescription(id: string, newDescription: string): Promise<boolean> {
        const target = await this.getById(id);

        if (!target) return false

        target.description = newDescription;

        return await this.update(target);
    }

    async checkIfExistsByName(name: string): Promise<boolean> {
        const all = await this.repo.read();
        return all.find(c => c.name === name) !== undefined
    }
}

export default CategoryService;