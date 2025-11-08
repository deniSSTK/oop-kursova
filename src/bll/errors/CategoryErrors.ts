export class CategoryAlreadyExists extends Error {
    constructor(name: string) {
        super(`Category with name '${name}' already exists`);
        this.name = 'CategoryAlreadyExists';
    }
}