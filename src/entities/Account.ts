import BaseEntity from "./BaseEntity";
import CurrencyEnum from "../enums/CurrencyEnum";

class Account extends BaseEntity {

    name: string;
    secondName: string;
    email: string;

    readonly role: AccountRoleEnum;
    readonly currency: CurrencyEnum;

    balance: number;

    private passwordHash: string;

    static readonly fileName: string = "accounts";

    constructor(
        name: string,
        secondName: string,
        email: string,
        role: AccountRoleEnum,
        currency: CurrencyEnum,
        passwordHash: string,
        startBalance: number = 0,
    ) {
        super()
        this.name = name;
        this.secondName = secondName;
        this.email = email;
        this.role = role;
        this.currency = currency;
        this.balance = startBalance;
        this.passwordHash = passwordHash;
    }
}

export default Account;