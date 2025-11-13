export class CategoryAlreadyExistsException extends Error {
    constructor(name: string) {
        super(`Category with name '${name}' already exists`);
        this.name = 'CategoryAlreadyExistsException';
    }
}