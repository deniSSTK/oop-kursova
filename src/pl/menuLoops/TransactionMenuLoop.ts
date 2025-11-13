import {rl} from "../main";
import MainMenuLoop from "./MainMenuLoop";
import Parser from "../../utils/Parsers";
import BaseMenuLoop from "./BaseMenuLoop";
import TransactionService from "../../bll/services/TransactionService";

class TransactionMenuLoop extends BaseMenuLoop {

    private readonly parser: Parser;
    private readonly transactionService: TransactionService;

    private readonly getMainMenu: () => MainMenuLoop;

    constructor(
        parser: Parser,
        transactionService: TransactionService,
        getMainMenu: () => MainMenuLoop,
    ) {
        super();
        this.parser = parser;
        this.transactionService = transactionService;

        this.getMainMenu = getMainMenu;
    }

    text: string = `
        1. Створити транзакцію
        2. Отримати всі транзакції за період
        3. Отримати статистику за категоріями
        4. Отримати транзакції за категорією
        5. Отримати транзакції за сумою
        6. Отримати транзакції за датою
        0. Головне меню
    `

    override options(): void {
        rl.question('Виберіть опцію: ', async (answer) => {
            switch (answer) {
                case '1':
                    console.log("Вкажіть: senderId receiverId categoryId amount");
                    rl.question('> ', async (input) => {
                        const [senderId, receiverId, categoryId, amountStr] = input.split(' ');
                        const amount = parseFloat(amountStr);

                        if (!senderId || !receiverId || !categoryId || isNaN(amount)) {
                            console.log('❌ Некоректні дані. Формат: senderId receiverId categoryId amount');
                            return this.start();
                        }

                        if (amount <= 0) {
                            console.log('❌ Сума має бути більшою за 0.');
                            return this.start();
                        }

                        if (senderId === receiverId) {
                            console.log('❌ Неможливо відправити транзакцію самому собі.');
                            return this.start();
                        }

                        try {
                            await this.transactionService.insert(senderId, receiverId, categoryId, amount);
                            console.log('✅ Транзакція створена');
                        } catch (err: any) {
                            console.log('Помилка:', err.message);
                        }

                        this.start();
                    });
                    return;

                case '2':
                    console.log("Вкажіть: accountId датаПочатку датаКінця (YYYY-MM-DD)");
                    rl.question('> ', async (input) => {
                        const [accountId, startStr, endStr] = input.split(' ');
                        const dateStart = this.parser.parseDateSafe(startStr);
                        const dateEnd = this.parser.parseDateSafe(endStr);

                        if (!accountId || !dateStart || !dateEnd) {
                            console.log('❌ Некоректні дані або формат дати.');
                            return this.start();
                        }

                        try {
                            const transactions = await this.transactionService.getAllByPeriod(accountId, dateStart, dateEnd);
                            console.log(transactions.length ? transactions : 'Немає транзакцій за вказаний період');
                        } catch (err: any) {
                            console.log('Помилка:', err.message);
                        }

                        this.start();
                    });
                    return;

                case '3':
                    console.log("Вкажіть: accountId датаПочатку датаКінця (YYYY-MM-DD)");
                    rl.question('> ', async (input) => {
                        const [accountId, startStr, endStr] = input.split(' ');
                        const dateStart = this.parser.parseDateSafe(startStr);
                        const dateEnd = this.parser.parseDateSafe(endStr);

                        if (!accountId || !dateStart || !dateEnd) {
                            console.log('❌ Некоректні дані або формат дати.');
                            return this.start();
                        }

                        try {
                            const stats = await this.transactionService.getStatsByCategories(accountId, dateStart, dateEnd);
                            console.log(Object.keys(stats).length ? stats : 'Немає статистики');
                        } catch (err: any) {
                            console.log('Помилка:', err.message);
                        }

                        this.start();
                    });
                    return;

                case '4':
                    console.log("Вкажіть categoryId");
                    rl.question('> ', async (categoryId) => {
                        if (!categoryId.trim()) {
                            console.log('❌ Порожній categoryId.');
                            return this.start();
                        }

                        try {
                            const transactions = await this.transactionService.getByCategoryId(categoryId);
                            console.log(transactions.length ? transactions : 'Немає транзакцій у цій категорії');
                        } catch (err: any) {
                            console.log('Помилка:', err.message);
                        }

                        this.start();
                    });
                    return;

                case '5':
                    console.log("Вкажіть суму (number)");
                    rl.question('> ', async (amountStr) => {
                        const amount = parseFloat(amountStr);
                        if (isNaN(amount) || amount <= 0) {
                            console.log('❌ Некоректна сума.');
                            return this.start();
                        }

                        try {
                            const transactions = await this.transactionService.getByAmount(amount);
                            console.log(transactions.length ? transactions : 'Немає транзакцій з такою сумою');
                        } catch (err: any) {
                            console.log('Помилка:', err.message);
                        }

                        this.start();
                    });
                    return;

                case '6':
                    console.log("Вкажіть дату (YYYY-MM-DD)");
                    rl.question('> ', async (dateStr) => {
                        const date = this.parser.parseDateSafe(dateStr);
                        if (!date) {
                            console.log('❌ Некоректний формат дати.');
                            return this.start();
                        }

                        try {
                            const transactions = await this.transactionService.getByDate(date);
                            console.log(transactions.length ? transactions : 'Немає транзакцій на цю дату');
                        } catch (err: any) {
                            console.log('Помилка:', err.message);
                        }

                        this.start();
                    });
                    return;

                case '0':
                    this.getMainMenu().start();
                    return;

                default:
                    console.log('Невірна опція');
                    this.start();
            }
        });
    }
}

export default TransactionMenuLoop;