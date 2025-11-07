import BaseEntity from "./BaseEntity";

class Transaction extends BaseEntity {

    readonly senderId: string;
    readonly receiverId: string;
    readonly categoryId: string;
    readonly amount: number;

    static readonly fileName: string = "transactions";

    constructor(
        senderId: string,
        receiverId: string,
        categoryId: string,
        amount: number,
    ) {
        super();
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.categoryId = categoryId;
        this.amount = amount;
    }
}

export default Transaction;