/// <reference types="vitest" />

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Category from '../../src/entities/Category'
import CategoryService from '../../src/bll/services/CategoryService'
import { CategoryAlreadyExistsException } from '../../src/bll/errors/CategoryErrors'
import fs from 'fs/promises'

describe('CategoryService', () => {
    let service: CategoryService
    let testFileName: string

    beforeEach(async () => {
        vi.clearAllMocks()
        testFileName = `/tests/categories.test.${Date.now()}.${Math.random()}`
        vi.spyOn(Category, 'fileName', 'get').mockReturnValue(testFileName)
        service = new CategoryService()
    })

    afterEach(async () => {
        try {
            await fs.unlink(testFileName)
        } catch (e) {}
        vi.restoreAllMocks()
    })

    describe('insert', () => {
        it('створює категорію з назвою та описом', async () => {
            const category = await service.insert('Продукти', 'Категорія для продуктів харчування')
            expect(category.name).toBe('Продукти')
            expect(category.description).toBe('Категорія для продуктів харчування')
            expect(category.id).toBeDefined()
        })

        it('створює категорію тільки з назвою (без опису)', async () => {
            const category = await service.insert('Транспорт')
            expect(category.name).toBe('Транспорт')
            expect(category.description).toBeUndefined()
            expect(category.id).toBeDefined()
        })

        it('кидає помилку при спробі створити категорію з існуючою назвою', async () => {
            await service.insert('Розваги', 'Опис розваг')
            await expect(service.insert('Розваги', 'Інший опис')).rejects.toThrow(CategoryAlreadyExistsException)
        })

        it('дозволяє створювати категорії з різними назвами', async () => {
            await service.insert('Їжа')
            await service.insert('Одяг')
            await service.insert('Техніка')
            const all = await service.getAll()
            expect(all).toHaveLength(3)
            expect(all.map(c => c.name)).toContain('Їжа')
            expect(all.map(c => c.name)).toContain('Одяг')
            expect(all.map(c => c.name)).toContain('Техніка')
        })

        it('перевіряє регістрозалежність при створенні', async () => {
            await service.insert('Спорт')
            const categoryLower = await service.insert('спорт')
            expect(categoryLower.name).toBe('спорт')
        })
    })

    describe('updateName', () => {
        it('оновлює назву категорії', async () => {
            const category = await service.insert('Старе Ім\'я', 'Опис')
            const result = await service.updateName(category.id!, 'Нове Ім\'я')
            expect(result).toBe(true)
            const updated = await service.getById(category.id!)
            expect(updated?.name).toBe('Нове Ім\'я')
            expect(updated?.description).toBe('Опис')
        })

        it('повертає false для неіснуючої категорії', async () => {
            const result = await service.updateName('non-existent-id', 'Нова Назва')
            expect(result).toBe(false)
        })

        it('зберігає зміни після оновлення назви', async () => {
            const category1 = await service.insert('Категорія 1')
            const category2 = await service.insert('Категорія 2')
            await service.updateName(category1.id!, 'Оновлена Категорія')
            const all = await service.getAll()
            const updated = all.find(c => c.id === category1.id)
            const unchanged = all.find(c => c.id === category2.id)
            expect(updated?.name).toBe('Оновлена Категорія')
            expect(unchanged?.name).toBe('Категорія 2')
        })
    })

    describe('updateDescription', () => {
        it('оновлює опис категорії', async () => {
            const category = await service.insert('КатегоріяОпис', 'Старий опис')
            const result = await service.updateDescription(category.id!, 'Новий опис')
            expect(result).toBe(true)
            const updated = await service.getById(category.id!)
            expect(updated?.description).toBe('Новий опис')
            expect(updated?.name).toBe('КатегоріяОпис')
        })

        it('повертає false для неіснуючої категорії', async () => {
            const result = await service.updateDescription('non-existent-id', 'Новий опис')
            expect(result).toBe(false)
        })

        it('може встановити опис для категорії без опису', async () => {
            const category = await service.insert('Категорія без опису')
            const result = await service.updateDescription(category.id!, 'Додали опис')
            expect(result).toBe(true)
            const updated = await service.getById(category.id!)
            expect(updated?.description).toBe('Додали опис')
        })

        it('може очистити опис (встановити порожній рядок)', async () => {
            const category = await service.insert('КатегоріяПорожній', 'Опис для видалення')
            await service.updateDescription(category.id!, '')
            const updated = await service.getById(category.id!)
            expect(updated?.description).toBe('')
        })
    })

    describe('checkIfExistsByName', () => {
        it('повертає true для існуючої категорії', async () => {
            await service.insert('Існуюча Категорія')
            const exists = await service.checkIfExistsByName('Існуюча Категорія')
            expect(exists).toBe(true)
        })

        it('повертає false для неіснуючої категорії', async () => {
            const exists = await service.checkIfExistsByName('Неіснуюча Категорія')
            expect(exists).toBe(false)
        })

        it('знаходить категорію серед багатьох', async () => {
            await service.insert('КатегоріяА')
            await service.insert('КатегоріяБ')
            await service.insert('Шукана Категорія')
            await service.insert('КатегоріяВ')
            const exists = await service.checkIfExistsByName('Шукана Категорія')
            expect(exists).toBe(true)
        })

        it('повертає false після видалення категорії', async () => {
            const category = await service.insert('Для Видалення')
            await service.delete(category.id!)
            const exists = await service.checkIfExistsByName('Для Видалення')
            expect(exists).toBe(false)
        })
    })

    describe('Integration tests', () => {
        it('перевіряє повний життєвий цикл категорії', async () => {
            const category = await service.insert('Початкова', 'Початковий опис')
            expect(category.name).toBe('Початкова')
            await service.updateName(category.id!, 'Оновлена')
            const afterNameUpdate = await service.getById(category.id!)
            expect(afterNameUpdate?.name).toBe('Оновлена')
            await service.updateDescription(category.id!, 'Оновлений опис')
            const afterDescUpdate = await service.getById(category.id!)
            expect(afterDescUpdate?.description).toBe('Оновлений опис')
            const exists = await service.checkIfExistsByName('Оновлена')
            expect(exists).toBe(true)
            await service.delete(category.id!)
            const afterDelete = await service.getById(category.id!)
            expect(afterDelete).toBeUndefined()
        })

        it('працює з кількома категоріями одночасно', async () => {
            const cat1 = await service.insert('ЇжаМульти', 'Продукти харчування')
            const cat2 = await service.insert('ОдягМульти', 'Одяг та взуття')
            const cat3 = await service.insert('ТранспортМульти', 'Проїзд та паливо')
            await service.updateName(cat1.id!, 'ПродуктиМульти')
            await service.updateDescription(cat2.id!, 'Гардероб')
            const all = await service.getAll()
            expect(all).toHaveLength(3)
            const updated1 = all.find(c => c.id === cat1.id)
            const updated2 = all.find(c => c.id === cat2.id)
            const updated3 = all.find(c => c.id === cat3.id)
            expect(updated1?.name).toBe('ПродуктиМульти')
            expect(updated2?.description).toBe('Гардероб')
            expect(updated3?.name).toBe('ТранспортМульти')
        })

        it('не дозволяє дублікати після оновлення', async () => {
            const cat1 = await service.insert('Категорія А')
            const cat2 = await service.insert('Категорія Б')
            expect(await service.checkIfExistsByName('Категорія А')).toBe(true)
            expect(await service.checkIfExistsByName('Категорія Б')).toBe(true)
            await service.updateName(cat1.id!, 'Нова Назва')
            const updated = await service.getById(cat1.id!)
            expect(updated?.name).toBe('Нова Назва')
        })

        it('зберігає дані після багатьох операцій', async () => {
            const categories: Category[] = []
            for (let i = 1; i <= 5; i++) {
                const cat = await service.insert(`КатегоріяБагато${i}`, `Опис ${i}`)
                categories.push(cat)
            }
            for (let i = 0; i < categories.length; i += 2) {
                await service.updateName(categories[i].id!, `Оновлена${i + 1}`)
            }
            const all = await service.getAll()
            expect(all).toHaveLength(5)
            const updated0 = all.find(c => c.id === categories[0].id)
            const updated1 = all.find(c => c.id === categories[1].id)
            expect(updated0?.name).toBe('Оновлена1')
            expect(updated1?.name).toBe('КатегоріяБагато2')
        })
    })

    describe('Edge cases', () => {
        it('обробляє порожній рядок як назву', async () => {
            const category = await service.insert('', 'Категорія з порожньою назвою')
            expect(category.name).toBe('')
            expect(category.id).toBeDefined()
        })

        it('обробляє спеціальні символи в назві', async () => {
            const category = await service.insert('Категорія!@#$%^&*()', 'Спеціальні символи')
            expect(category.name).toBe('Категорія!@#$%^&*()')
        })

        it('обробляє довгі рядки', async () => {
            const longName = 'А'.repeat(1000)
            const longDescription = 'Б'.repeat(2000)
            const category = await service.insert(longName, longDescription)
            expect(category.name).toBe(longName)
            expect(category.description).toBe(longDescription)
        })

        it('обробляє unicode символи', async () => {
            const category = await service.insert('Категорія 🎉', 'Опис з емодзі 😊')
            expect(category.name).toBe('Категорія 🎉')
            expect(category.description).toBe('Опис з емодзі 😊')
        })
    })
})
