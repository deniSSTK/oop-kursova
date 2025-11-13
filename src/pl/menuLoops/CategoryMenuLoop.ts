import { rl } from "../main";
import BaseMenuLoop from "./BaseMenuLoop";
import MainMenuLoop from "./MainMenuLoop";
import CategoryService from "../../bll/services/CategoryService";

class CategoryMenuLoop extends BaseMenuLoop {

    private readonly categoryService: CategoryService;

    private readonly getMainMenu: () => MainMenuLoop;

    constructor(
        categoryService: CategoryService,
        getMainMenu: () => MainMenuLoop
    ) {
        super();
        this.categoryService = categoryService;

        this.getMainMenu = getMainMenu;
    }

    text: string = `
        1. Додати категорію
        2. Видалити категорію (по id)
        3. Змінити ім'я
        4. Змінити опис
        5. Подивитися всі 
        0. Головне меню
    `

    override options(): void {
        rl.question('Виберіть опцію: ', async (answer) => {
            switch (answer.trim()) {
                case '1':
                    rl.question('Вкажіть назву та опис (не обов’язково): ', async (input) => {
                        const [name, ...descParts] = input.trim().split(" ");
                        if (!name) {
                            console.log('Назва обов’язкова');
                            return this.start();
                        }
                        try {
                            await this.categoryService.insert(name, descParts.join(" "));
                            console.log('✅ Категорію додано');
                        } catch (err: any) {
                            console.log('❌ Помилка:', err.message);
                        }
                        this.start();
                    });
                    break;

                case '2':
                    rl.question('ID категорії для видалення: ', async (id) => {
                        if (!id) {
                            console.log('ID обов’язкове');
                            return this.start();
                        }
                        try {
                            await this.categoryService.delete(id);
                            console.log('✅ Категорію видалено');
                        } catch (err: any) {
                            console.log('❌ Помилка:', err.message);
                        }
                        this.start();
                    });
                    break;

                case '3':
                    rl.question('ID та нове ім’я: ', async (input) => {
                        const [id, ...nameParts] = input.trim().split(" ");
                        if (!id || nameParts.length === 0) {
                            console.log('Потрібно вказати id і нове ім’я');
                            return this.start();
                        }
                        try {
                            await this.categoryService.updateName(id, nameParts.join(" "));
                            console.log('✅ Ім’я змінено');
                        } catch (err: any) {
                            console.log('❌ Помилка:', err.message);
                        }
                        this.start();
                    });
                    break;

                case '4':
                    rl.question('ID та новий опис: ', async (input) => {
                        const [id, ...descParts] = input.trim().split(" ");
                        if (!id) {
                            console.log('Потрібно вказати id і опис');
                            return this.start();
                        }
                        try {
                            await this.categoryService.updateDescription(id, descParts.join(" "));
                            console.log('✅ Опис змінено');
                        } catch (err: any) {
                            console.log('❌ Помилка:', err.message);
                        }
                        this.start();
                    });
                    break;

                case '5':
                    try {
                        const categories = await this.categoryService.getAll();
                        if (!categories.length) {
                            console.log('Немає жодної категорії');
                        } else {
                            console.log('\nСписок категорій:');
                            for (const cat of categories) {
                                console.log(`ID: ${cat.id} | Назва: ${cat.name} | Опис: ${cat.description || '-'}`);
                            }
                        }
                    } catch (err: any) {
                        console.log('❌ Помилка:', err.message);
                    }
                    this.start();
                    break;

                case '0':
                    this.getMainMenu().start();
                    break;

                default:
                    console.log('Невірна опція');
                    this.start();
            }
        });
    }
}

export default CategoryMenuLoop;