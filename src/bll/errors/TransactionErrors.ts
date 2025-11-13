export class NotEnoughBalanceException extends Error {
    constructor(senderId: string, amount: number) {
        super(`Sender ${senderId} does not have enough balance to send ${amount}`);
        this.name = 'NotEnoughBalanceException';
    }
}

export class UpdatingAccountException extends Error {
    constructor(senderId: string, amount: number) {
        super(`While updating account ${senderId} amount ${amount}`);
        this.name = 'UpdatingAccountException';
    }
}