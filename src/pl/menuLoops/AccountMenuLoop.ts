import BaseMenuLoop from "./BaseMenuLoop";
import {rl} from "../main";
import Validator from "../../utils/Validator";
import AccountService from "../../bll/services/AccountService";
import MainMenuLoop from "./MainMenuLoop";

class AccountMenuLoop extends BaseMenuLoop {

    private readonly validator: Validator;
    private readonly accountService: AccountService;

    private readonly getMainMenu: () => MainMenuLoop;

    constructor(
        validator: Validator,
        accountService: AccountService,
        getMainMenu: () => MainMenuLoop
    ) {
        super();
        this.validator = validator;
        this.accountService = accountService;
        this.getMainMenu = getMainMenu;
    }

    text: string = `
        1. Створити рахунок
        2. Змінити ім'я
        3. Змінити фамілію
        4. Змінити пошту
        5. Оновити баланс
        6. Отримати баланс по id
        0. Головне меню
    `

    override options(): void {
        rl.question('Виберіть опцію: ', async (answer) => {
            switch (answer) {
                case '1':
                    console.log("Вкажіть: ім'я фамілію пошту пароль валюту (UAH/USD/EUR) роль (USER/ADMIN) початковий баланс (необов'язково)");
                    rl.question('> ', async (input) => {
                        const [name, secondName, email, password, currency, role, startBalanceStr] = input.split(' ');
                        const startBalance = startBalanceStr ? parseFloat(startBalanceStr) : 0;

                        if (!name || !secondName || !email || !password || !currency || !role) {
                            console.log('❌ Усі поля, крім балансу, є обов’язковими.');
                            return this.start();
                        }

                        if (!this.validator.isValidEmail(email)) {
                            console.log('❌ Некоректний email.');
                            return this.start();
                        }

                        if (!this.validator.isValidCurrency(currency)) {
                            console.log('❌ Непідтримувана валюта. Використовуйте: UAH, USD або EUR.');
                            return this.start();
                        }

                        if (!this.validator.isValidRole(role)) {
                            console.log('❌ Некоректна роль. Використовуйте: USER або ADMIN.');
                            return this.start();
                        }

                        if (startBalanceStr && isNaN(startBalance)) {
                            console.log('❌ Некоректне значення балансу.');
                            return this.start();
                        }

                        try {
                            await this.accountService.insert(
                                name,
                                secondName,
                                email,
                                password,
                                currency as any,
                                role as any,
                                startBalance
                            );
                            console.log('✅ Рахунок створено');
                        } catch (err: any) {
                            console.log('Помилка:', err.message);
                        }

                        this.start();
                    });
                    return;

                case '2':
                    console.log("Вкажіть id та нове ім'я");
                    rl.question('> ', async (input) => {
                        const [id, ...newNameParts] = input.split(' ');
                        const newName = newNameParts.join(' ');

                        if (!id || !newName) {
                            console.log('❌ Некоректні дані.');
                            return this.start();
                        }

                        const result = await this.accountService.updateWithTarget(id, newName, 'name');
                        console.log(result ? '✅ Ім\'я оновлено' : '❌ Рахунок не знайдено');
                        this.start();
                    });
                    return;

                case '3':
                    console.log("Вкажіть id та нову фамілію");
                    rl.question('> ', async (input) => {
                        const [id, ...newSurnameParts] = input.split(' ');
                        const newSurname = newSurnameParts.join(' ');

                        if (!id || !newSurname) {
                            console.log('❌ Некоректні дані.');
                            return this.start();
                        }

                        const result = await this.accountService.updateWithTarget(id, newSurname, 'secondName');
                        console.log(result ? '✅ Фамілію оновлено' : '❌ Рахунок не знайдено');
                        this.start();
                    });
                    return;

                case '4':
                    console.log("Вкажіть id та нову пошту");
                    rl.question('> ', async (input) => {
                        const [id, newEmail] = input.split(' ');

                        if (!id || !newEmail) {
                            console.log('❌ Некоректні дані.');
                            return this.start();
                        }

                        if (!this.validator.isValidEmail(newEmail)) {
                            console.log('❌ Некоректний email.');
                            return this.start();
                        }

                        const result = await this.accountService.updateWithTarget(id, newEmail, 'email');
                        console.log(result ? '✅ Пошту оновлено' : '❌ Рахунок не знайдено');
                        this.start();
                    });
                    return;

                case '5':
                    console.log("Вкажіть id та суму (може бути від’ємна)");
                    rl.question('> ', async (input) => {
                        const [id, amountStr] = input.split(' ');
                        const amount = parseFloat(amountStr);

                        if (!id || isNaN(amount)) {
                            console.log('❌ Некоректні дані.');
                            return this.start();
                        }

                        const result = await this.accountService.updateBalance(id, amount);
                        console.log(result ? '✅ Баланс оновлено' : '❌ Рахунок не знайдено');
                        this.start();
                    });
                    return;

                case '6':
                    console.log("Вкажіть id рахунку");
                    rl.question('> ', async (id) => {
                        if (!id.trim()) {
                            console.log('❌ Порожній id.');
                            return this.start();
                        }

                        const balance = await this.accountService.getBalanceById(id);
                        console.log(balance !== null ? `💰 Баланс: ${balance}` : '❌ Рахунок не знайдено');
                        this.start();
                    });
                    return;

                case '0':
                    this.getMainMenu().start();
                    return;

                default:
                    console.log('❌ Невірна опція');
                    this.start();
            }
        });
    }
}

export default AccountMenuLoop;