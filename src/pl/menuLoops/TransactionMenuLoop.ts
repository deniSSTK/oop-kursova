import { transactionService, main, rl } from "../main";
import {parseDateSafe} from "../../utils/Parsers";

function transactionMenuLoop() {
    console.log(`
        1. Створити транзакцію
        2. Отримати всі транзакції за період
        3. Отримати статистику за категоріями
        4. Отримати транзакції за категорією
        5. Отримати транзакції за сумою
        6. Отримати транзакції за датою
        0. Головне меню
    `);

    rl.question('Виберіть опцію: ', async (answer) => {
        switch (answer) {
            case '1':
                console.log("Вкажіть: senderId receiverId categoryId amount");
                rl.question('> ', async (input) => {
                    const [senderId, receiverId, categoryId, amountStr] = input.split(' ');
                    const amount = parseFloat(amountStr);

                    if (!senderId || !receiverId || !categoryId || isNaN(amount)) {
                        console.log('❌ Некоректні дані. Формат: senderId receiverId categoryId amount');
                        return transactionMenuLoop();
                    }

                    if (amount <= 0) {
                        console.log('❌ Сума має бути більшою за 0.');
                        return transactionMenuLoop();
                    }

                    if (senderId === receiverId) {
                        console.log('❌ Неможливо відправити транзакцію самому собі.');
                        return transactionMenuLoop();
                    }

                    try {
                        await transactionService.insert(senderId, receiverId, categoryId, amount);
                        console.log('✅ Транзакція створена');
                    } catch (err: any) {
                        console.log('Помилка:', err.message);
                    }

                    transactionMenuLoop();
                });
                return;

            case '2':
                console.log("Вкажіть: accountId датаПочатку датаКінця (YYYY-MM-DD)");
                rl.question('> ', async (input) => {
                    const [accountId, startStr, endStr] = input.split(' ');
                    const dateStart = parseDateSafe(startStr);
                    const dateEnd = parseDateSafe(endStr);

                    if (!accountId || !dateStart || !dateEnd) {
                        console.log('❌ Некоректні дані або формат дати.');
                        return transactionMenuLoop();
                    }

                    try {
                        const transactions = await transactionService.getAllByPeriod(accountId, dateStart, dateEnd);
                        console.log(transactions.length ? transactions : 'Немає транзакцій за вказаний період');
                    } catch (err: any) {
                        console.log('Помилка:', err.message);
                    }

                    transactionMenuLoop();
                });
                return;

            case '3':
                console.log("Вкажіть: accountId датаПочатку датаКінця (YYYY-MM-DD)");
                rl.question('> ', async (input) => {
                    const [accountId, startStr, endStr] = input.split(' ');
                    const dateStart = parseDateSafe(startStr);
                    const dateEnd = parseDateSafe(endStr);

                    if (!accountId || !dateStart || !dateEnd) {
                        console.log('❌ Некоректні дані або формат дати.');
                        return transactionMenuLoop();
                    }

                    try {
                        const stats = await transactionService.getStatsByCategories(accountId, dateStart, dateEnd);
                        console.log(Object.keys(stats).length ? stats : 'Немає статистики');
                    } catch (err: any) {
                        console.log('Помилка:', err.message);
                    }

                    transactionMenuLoop();
                });
                return;

            case '4':
                console.log("Вкажіть categoryId");
                rl.question('> ', async (categoryId) => {
                    if (!categoryId.trim()) {
                        console.log('❌ Порожній categoryId.');
                        return transactionMenuLoop();
                    }

                    try {
                        const transactions = await transactionService.getByCategoryId(categoryId);
                        console.log(transactions.length ? transactions : 'Немає транзакцій у цій категорії');
                    } catch (err: any) {
                        console.log('Помилка:', err.message);
                    }

                    transactionMenuLoop();
                });
                return;

            case '5':
                console.log("Вкажіть суму (number)");
                rl.question('> ', async (amountStr) => {
                    const amount = parseFloat(amountStr);
                    if (isNaN(amount) || amount <= 0) {
                        console.log('❌ Некоректна сума.');
                        return transactionMenuLoop();
                    }

                    try {
                        const transactions = await transactionService.getByAmount(amount);
                        console.log(transactions.length ? transactions : 'Немає транзакцій з такою сумою');
                    } catch (err: any) {
                        console.log('Помилка:', err.message);
                    }

                    transactionMenuLoop();
                });
                return;

            case '6':
                console.log("Вкажіть дату (YYYY-MM-DD)");
                rl.question('> ', async (dateStr) => {
                    const date = parseDateSafe(dateStr);
                    if (!date) {
                        console.log('❌ Некоректний формат дати.');
                        return transactionMenuLoop();
                    }

                    try {
                        const transactions = await transactionService.getByDate(date);
                        console.log(transactions.length ? transactions : 'Немає транзакцій на цю дату');
                    } catch (err: any) {
                        console.log('Помилка:', err.message);
                    }

                    transactionMenuLoop();
                });
                return;

            case '0':
                main();
                return;

            default:
                console.log('Невірна опція');
                transactionMenuLoop();
        }
    });
}

export default transactionMenuLoop;