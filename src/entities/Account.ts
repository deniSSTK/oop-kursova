import BaseEntity from "./BaseEntity";
import CurrencyEnum from "../enums/CurrencyEnum";
import AccountRoleEnum from "../enums/AccountRolesEnum";

class Account extends BaseEntity {

    name: string;
    secondName: string;
    email: string;
    passwordHash: string;

    readonly role: AccountRoleEnum;
    readonly currency: CurrencyEnum;

    balance: number;

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