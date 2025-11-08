import { categoryService, main, rl } from "../main";

export function categoryMenuLoop() {
    console.log(`
        1. Додати категорію
        2. Видалити категорію (по id)
        3. Змінити ім'я
        4. Змінити опис
        5. Подивитися всі 
        0. Головне меню
    `);

    rl.question('Виберіть опцію: ', async (answer) => {
        switch(answer) {
            case '1':
                console.log('Вкажіть назву та опис (не обов\'язково) в форматі: назва опис');
                rl.question('> ', async (input) => {
                    const [name, ...descriptionParts] = input.split(" ");
                    const description = descriptionParts.join(" ");
                    try {
                        await categoryService.insert(name, description);
                        console.log('Категорія додана');
                    } catch (err: any) {
                        console.log('Помилка:', err.message);
                    }
                    categoryMenuLoop();
                });
                return;

            case '2':
                console.log('Вкажіть id категорії для видалення:');
                rl.question('> ', async (id) => {
                    try {
                        await categoryService.delete(id);
                        console.log('Категорія видалена');
                    } catch (err: any) {
                        console.log('Помилка:', err.message);
                    }
                    categoryMenuLoop();
                });
                return;

            case '3':
                console.log('Вкажіть id категорії та нове ім\'я в форматі: id нове_імя');
                rl.question('> ', async (input) => {
                    const [id, ...nameParts] = input.split(" ");
                    const newName = nameParts.join(" ");
                    try {
                        await categoryService.updateName(id, newName);
                        console.log('Ім\'я категорії змінено');
                    } catch (err: any) {
                        console.log('Помилка:', err.message);
                    }
                    categoryMenuLoop();
                });
                return;

            case '4':
                console.log('Вкажіть id категорії та новий опис в форматі: id новий_опис');
                rl.question('> ', async (input) => {
                    const [id, ...descriptionParts] = input.split(" ");
                    const newDescription = descriptionParts.join(" ");
                    try {
                        await categoryService.updateDescription(id, newDescription);
                        console.log('Опис категорії змінено');
                    } catch (err: any) {
                        console.log('Помилка:', err.message);
                    }
                    categoryMenuLoop();
                });
                return;

            case '5':
                try {
                    const categories = await categoryService.getAll();
                    console.log('Список категорій:');
                    categories.forEach(cat => {
                        console.log(`ID: ${cat.id}, Назва: ${cat.name}, Опис: ${cat.description}`);
                    });
                } catch (err: any) {
                    console.log('Помилка:', err.message);
                }
                categoryMenuLoop();
                return;

            case '0':
                main();
                return;

            default:
                console.log('Невірна опція');
        }
        categoryMenuLoop();
    });
}
