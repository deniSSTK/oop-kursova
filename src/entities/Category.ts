import BaseEntity from "./BaseEntity";

class Category extends BaseEntity {
    name: string;

    description?: string;

    static readonly fileName: string = "categories";

    constructor(
        name: string,
        description?: string,
    ) {
        super();
        this.name = name;
        this.description = description;
    }
}

export default Category;