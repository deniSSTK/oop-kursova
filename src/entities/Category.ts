import BaseEntity from "./BaseEntity";
import CategoryTypeEnum from "../enums/CategoryTypeEnum";

class Category extends BaseEntity {
    name: string;
    type: CategoryTypeEnum;

    description?: string;

    static readonly fileName: string = "categories";

    constructor(
        name: string,
        type: CategoryTypeEnum,
        description?: string,
    ) {
        super();
        this.name = name;
        this.type = type;
        this.description = description;
    }
}

export default Category;