import { v4 as uuidv4 } from 'uuid';

class BaseEntity {
    private readonly _id: string;
    private readonly _createdAt: number;

    static readonly fileName: string = "";

    constructor() {
        this._id = uuidv4();
        this._createdAt = Date.now();
    }

    get id() {
        return this._id;
    }

    get createdAt() {
        return this._createdAt;
    }
}


export default BaseEntity;