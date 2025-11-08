import CategoryService from "../bll/services/CategoryService";
import AccountService from "../bll/services/AccountService";
import TransactionService from "../bll/services/TransactionService";

import readline from 'readline';
import categoryMenuLoop from "./menuLoops/CategoryMenuLoop";
import accountMenuLoop from "./menuLoops/AccountMenuLoop";
import transactionMenuLoop from "./menuLoops/TransactionMenuLoop";

export const categoryService = new CategoryService();
export const accountService = new AccountService();
export const transactionService = new TransactionService(accountService);

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export function main() {
    console.log(`
        1. Управління категоріями
        2. Управління рахунками
        3. Управління витратами та доходами
        0. Вихід
    `)

    rl.question('Виберіть опцію: ', async (answer) => {
        switch(answer) {
            case '1':
                categoryMenuLoop();
                return;
            case '2':
                accountMenuLoop();
                return;
            case '3':
                transactionMenuLoop();
                return;
            case '0':
                rl.close();
                return;
            default:
                console.log('Невірна опція');
        }
        main();
    });
}

main();