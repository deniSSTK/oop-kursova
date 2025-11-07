import Account from "../../entities/Account";
import FileRepository from "../../dal/repositories/FileRepository";
import CurrencyEnum from "../../enums/CurrencyEnum";

import argon2 from "argon2";
import Category from "../../entities/Category";
import BaseService from "./BaseService";
import TransactionService from "./TransactionService";
import AccountRoleEnum from "../../enums/AccountRolesEnum";

class AccountService extends BaseService<Account> {

    constructor() {
        super(new FileRepository<Account>(Account.fileName));
    }

    async insert(
        name: string,
        secondName: string,
        email: string,
        password: string,
        currency: CurrencyEnum,
        role: AccountRoleEnum,
        startBalance?: number,
    ): Promise<Account> {
        const passwordHash = await argon2.hash(password, {
            type: argon2.argon2id,
            timeCost: 3,
            memoryCost: 1 << 16,
            parallelism: 1,
        })

        const newAccount = new Account(
            name,
            secondName,
            email,
            role,
            currency,
            passwordHash,
            startBalance
        );

        await this.repo.insert(newAccount)
        return newAccount;
    }

    async updateWithTarget(id: string, value: string, target: 'name' | 'secondName' | 'email'): Promise<Account | null> {
        const accounts = await this.repo.read();
        const account = accounts.find(a => a.id === id);

        if (!account) return null;

        account[target] = value;
        await this.repo.writeAll(accounts);
        return account;
    }

    async updateBalance(accountId: string, amount: number): Promise<Account | null> {
        const accounts = await this.repo.read();
        const account = accounts.find(a => a.id === accountId);

        if (!account) return null;

        account.balance += amount;
        await this.repo.writeAll(accounts);
        return account;
    }

    async getBalanceById(id: string): Promise<number | null> {
        const accounts = await this.repo.read();
        const account = accounts.find(a => a.id === id);

        if (!account) return null;

        return account.balance;
    }
}

export default AccountService;