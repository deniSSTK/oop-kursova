import {rl} from "../main";
import TransactionMenuLoop from "./TransactionMenuLoop";
import BaseMenuLoop from "./BaseMenuLoop";
import CategoryMenuLoop from "./CategoryMenuLoop";
import AccountMenuLoop from "./AccountMenuLoop";

class MainMenuLoop extends BaseMenuLoop {

    private readonly accountMenuLoop: AccountMenuLoop;
    private readonly categoryMenuLoop: CategoryMenuLoop;
    private readonly transactionMenuLoop: TransactionMenuLoop;

    override readonly text: string = `
        1. Управління категоріями
        2. Управління рахунками
        3. Управління витратами та доходами
        0. Вихід
    `

    constructor(
        accountMenuLoop: AccountMenuLoop,
        categoryMenuLoop: CategoryMenuLoop,
        transactionMenuLoop: TransactionMenuLoop,
    ) {
        super();
        this.accountMenuLoop = accountMenuLoop;
        this.categoryMenuLoop = categoryMenuLoop;
        this.transactionMenuLoop = transactionMenuLoop;
    }

    options(): void {
        rl.question('Виберіть опцію: ', async (answer) => {
            switch(answer) {
                case '1':
                    this.categoryMenuLoop.start();
                    return;
                case '2':
                    this.accountMenuLoop.start();
                    return;
                case '3':
                    this.transactionMenuLoop.start();
                    return;
                case '0':
                    rl.close();
                    return;
                default:
                    console.log('Невірна опція');
            }
            this.start();
        });
    }
}

export default MainMenuLoop;