import Category from "../../entities/Category";
import FileRepository from "../../dal/repositories/FileRepository";
import CategoryTypeEnum from "../../enums/CategoryTypeEnum";
import BaseService from "../interfaces/BaseService";

class CategoryService extends BaseService<Category> {
    constructor() {
        super(new FileRepository<Category>(Category.fileName));
    }

    async insert(
        name: string,
        type: CategoryTypeEnum,
        description?: string,
    ): Promise<Category> {
        const newCategory = new Category(
            name,
            type,
            description,
        )

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

    async updateType(id: string): Promise<boolean> {
        const target = await this.getById(id);

        if (!target) return false

        target.type = target.type === CategoryTypeEnum.INCOME ? CategoryTypeEnum.OUTCOME : CategoryTypeEnum.INCOME;

        return await this.update(target);
    }

}

export default CategoryService;