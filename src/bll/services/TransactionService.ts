import FileRepository from "../../dal/repositories/FileRepository";

import BaseService from "./BaseService";
import Transaction from "../../entities/Transaction";
import AccountService from "./AccountsService";

class TransactionService extends BaseService<Transaction> {

    private readonly accountService: AccountService;

    constructor(accountService: AccountService) {
        super(new FileRepository<Transaction>(Transaction.fileName));
        this.accountService = accountService;
    }

    async insert(
        senderId: string,
        receiverId: string,
        categoryId: string,
        amount: number
    ): Promise<Transaction> {
        const senderBalance = await this.accountService.getBalanceById(senderId)
        if (!senderBalance || senderBalance < amount) {
            throw  new Error(`Sender ${senderId} does not have enough balance to send ${amount}`);
        }

        const newTransaction = new Transaction(
            senderId,
            receiverId,
            categoryId,
            amount,
        );

        if (!await this.accountService.updateBalance(senderId, -amount)) {
            throw  new Error(`While updating account ${senderId} amount ${-amount}`);
        } else if (!await this.accountService.updateBalance(receiverId, amount)) {
            throw  new Error(`While updating account ${receiverId} amount ${amount}`);
        }

        await this.repo.insert(newTransaction)
        return newTransaction;
    }

    async getAllByPeriod(accountId: string, dateStart: Date, dateEnd: Date): Promise<Transaction[]> {
        const allUserTransactions = await this.getAll()

        return allUserTransactions.filter(tx =>
            (tx.senderId === accountId || tx.receiverId === accountId) &&
            tx.createdAt >= dateStart.getTime() &&
            tx.createdAt <= dateEnd.getTime()
        );
    }

    async getStatsByCategories(accountId: string, dateStart: Date, dateEnd: Date) {
        const transactions = await this.getAllByPeriod(accountId, dateStart, dateEnd);

        const statsByCategories: Record<string, { income: number; expense: number }> = {};

        for (const tx of transactions) {
            const categoryId = tx.categoryId;

            if (!statsByCategories[categoryId]) {
                statsByCategories[categoryId] = { income: 0, expense: 0 };
            }

            if (tx.receiverId === accountId) {
                statsByCategories[categoryId].income += tx.amount;
            } else if (tx.senderId === accountId) {
                statsByCategories[categoryId].expense += tx.amount;
            }
        }

        return statsByCategories;
    }

    async getByCategoryId(categoryId: string): Promise<Transaction[]> {
        const all = await this.getAll()
        return all.filter(tx => tx.categoryId === categoryId)
    }

    async getByAmount(amount: number): Promise<Transaction[]> {
        const transactions = await this.getAll()
        return transactions.filter(tx => tx.amount === amount)
    }

    async getByDate(targetDate: Date): Promise<Transaction[]> {
        const all = await this.getAll();

        const targetDay = targetDate.getDate();
        const targetMonth = targetDate.getMonth();
        const targetYear = targetDate.getFullYear();

        return all.filter(tx => {
            const txDate = new Date(tx.createdAt);
            return (
                txDate.getDate() === targetDay &&
                txDate.getMonth() === targetMonth &&
                txDate.getFullYear() === targetYear
            );
        });
    }


    override async update(): Promise<boolean> {
        return false;
    }
}

export default TransactionService;