import { accountService, main, rl } from "../main";

export function accountMenuLoop() {
    console.log(`
        1. Створити рахунок
        2. Змінити ім'я
        3. Змінити фамілію
        4. Змінити пошту
        5. Оновити баланс
        6. Отримати баланс по id
        0. Головне меню
    `);

    rl.question('Виберіть опцію: ', async (answer) => {
        switch (answer) {
            case '1':
                console.log("Вкажіть: ім'я, фамілію, пошту, пароль, валюту (UAH/USD/EUR), роль (USER/ADMIN), початковий баланс (необов'язково)");
                rl.question('> ', async (input) => {
                    const [name, secondName, email, password, currency, role, startBalanceStr] = input.split(' ');
                    const startBalance = startBalanceStr ? parseFloat(startBalanceStr) : 0;

                    try {
                        await accountService.insert(name, secondName, email, password, currency as any, role as any, startBalance);
                        console.log('Рахунок створено');
                    } catch (err: any) {
                        console.log('Помилка:', err.message);
                    }

                    accountMenuLoop();
                });
                return;

            case '2':
                console.log("Вкажіть id та нове ім'я");
                rl.question('> ', async (input) => {
                    const [id, ...newNameParts] = input.split(' ');
                    const newName = newNameParts.join(' ');
                    const result = await accountService.updateWithTarget(id, newName, 'name');
                    console.log(result ? 'Ім\'я оновлено' : 'Рахунок не знайдено');
                    accountMenuLoop();
                });
                return;

            case '3':
                console.log("Вкажіть id та нову фамілію");
                rl.question('> ', async (input) => {
                    const [id, ...newSurnameParts] = input.split(' ');
                    const newSurname = newSurnameParts.join(' ');
                    const result = await accountService.updateWithTarget(id, newSurname, 'secondName');
                    console.log(result ? 'Фамілію оновлено' : 'Рахунок не знайдено');
                    accountMenuLoop();
                });
                return;

            case '4':
                console.log("Вкажіть id та нову пошту");
                rl.question('> ', async (input) => {
                    const [id, newEmail] = input.split(' ');
                    const result = await accountService.updateWithTarget(id, newEmail, 'email');
                    console.log(result ? 'Пошту оновлено' : 'Рахунок не знайдено');
                    accountMenuLoop();
                });
                return;

            case '5':
                console.log("Вкажіть id та суму (може бути від’ємна)");
                rl.question('> ', async (input) => {
                    const [id, amountStr] = input.split(' ');
                    const amount = parseFloat(amountStr);
                    const result = await accountService.updateBalance(id, amount);
                    console.log(result ? 'Баланс оновлено' : 'Рахунок не знайдено');
                    accountMenuLoop();
                });
                return;

            case '6':
                console.log("Вкажіть id рахунку");
                rl.question('> ', async (id) => {
                    const balance = await accountService.getBalanceById(id);
                    console.log(balance !== null ? `Баланс: ${balance}` : 'Рахунок не знайдено');
                    accountMenuLoop();
                });
                return;

            case '0':
                main();
                return;

            default:
                console.log('Невірна опція');
                accountMenuLoop();
        }
    });
}
