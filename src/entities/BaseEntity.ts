import { v4 as uuidv4 } from 'uuid';

class BaseEntity {
    readonly id: string;
    readonly createdAt: number;

    static readonly fileName: string = "";

    constructor() {
        this.id = uuidv4();
        this.createdAt = Date.now();
    }
}

export default BaseEntity;