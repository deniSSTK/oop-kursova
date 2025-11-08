export class NotEnoughBalance extends Error {
    constructor(senderId: string, amount: number) {
        super(`Sender ${senderId} does not have enough balance to send ${amount}`);
        this.name = 'NotEnoughBalance';
    }
}

export class UpdatingAccountBalance extends Error {
    constructor(senderId: string, amount: number) {
        super(`While updating account ${senderId} amount ${amount}`);
        this.name = 'UpdatingAccountBalance';
    }
}