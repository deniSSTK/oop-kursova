/// <reference types="vitest" />

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Transaction from '../../src/entities/Transaction'
import TransactionService from '../../src/bll/services/TransactionService'
import AccountService from '../../src/bll/services/AccountService'
import Account from '../../src/entities/Account'
import CurrencyEnum from '../../src/enums/CurrencyEnum'
import AccountRoleEnum from '../../src/enums/AccountRolesEnum'
import { NotEnoughBalanceException } from '../../src/bll/errors/TransactionErrors'
import fs from 'fs/promises'

vi.mock('argon2', () => ({
    default: {
        hash: vi.fn(),
        argon2id: 2
    },
    hash: vi.fn(),
    argon2id: 2
}))

import argon2 from 'argon2'

describe('TransactionService', () => {
    let transactionService: TransactionService
    let accountService: AccountService
    let transactionFileName: string
    let accountFileName: string

    let sender: Account
    let receiver: Account
    const categoryId = 'test-category-id'

    beforeEach(async () => {
        vi.clearAllMocks()

        transactionFileName = `/tests/transactions.test.${Date.now()}.${Math.random()}.json`
        accountFileName = `/tests/accounts.test.${Date.now()}.${Math.random()}.json`

        vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

        vi.spyOn(Transaction, 'fileName', 'get').mockReturnValue(transactionFileName)
        vi.spyOn(Account, 'fileName', 'get').mockReturnValue(accountFileName)

        accountService = new AccountService()
        transactionService = new TransactionService(accountService)

        sender = await accountService.insert(
            'Sender',
            'User',
            'sender@test.com',
            'password',
            CurrencyEnum.UAH,
            AccountRoleEnum.ACCOUNT,
            1000
        )

        receiver = await accountService.insert(
            'Receiver',
            'User',
            'receiver@test.com',
            'password',
            CurrencyEnum.UAH,
            AccountRoleEnum.ACCOUNT,
            500
        )
    })

    afterEach(async () => {
        try {
            await fs.unlink(transactionFileName)
        } catch (e) {
        }
        try {
            await fs.unlink(accountFileName)
        } catch (e) {
        }
        vi.restoreAllMocks()
    })

    describe('insert', () => {
        it('створює транзакцію та оновлює баланси', async () => {
            const amount = 100

            const transaction = await transactionService.insert(
                sender.id!,
                receiver.id!,
                categoryId,
                amount
            )

            expect(transaction.senderId).toBe(sender.id)
            expect(transaction.receiverId).toBe(receiver.id)
            expect(transaction.categoryId).toBe(categoryId)
            expect(transaction.amount).toBe(amount)
            expect(transaction.id).toBeDefined()
            expect(transaction.createdAt).toBeDefined()

            const senderBalance = await accountService.getBalanceById(sender.id!)
            const receiverBalance = await accountService.getBalanceById(receiver.id!)

            expect(senderBalance).toBe(900)
            expect(receiverBalance).toBe(600)
        })

        it('кидає помилку при недостатньому балансі', async () => {
            const amount = 2000

            await expect(
                transactionService.insert(sender.id!, receiver.id!, categoryId, amount)
            ).rejects.toThrow(NotEnoughBalanceException)

            const senderBalance = await accountService.getBalanceById(sender.id!)
            const receiverBalance = await accountService.getBalanceById(receiver.id!)

            expect(senderBalance).toBe(1000)
            expect(receiverBalance).toBe(500)
        })

        it('кидає помилку при нульовому балансі відправника', async () => {
            const zeroBalanceAccount = await accountService.insert(
                'Zero',
                'Balance',
                'zero@test.com',
                'password',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                0
            )

            await expect(
                transactionService.insert(zeroBalanceAccount.id!, receiver.id!, categoryId, 10)
            ).rejects.toThrow(NotEnoughBalanceException)
        })

        it('кидає помилку при неіснуючому відправнику', async () => {
            await expect(
                transactionService.insert('non-existent-id', receiver.id!, categoryId, 100)
            ).rejects.toThrow(NotEnoughBalanceException)
        })

        it('дозволяє повну передачу балансу', async () => {
            const fullAmount = 1000

            const transaction = await transactionService.insert(
                sender.id!,
                receiver.id!,
                categoryId,
                fullAmount
            )

            expect(transaction.amount).toBe(fullAmount)

            const senderBalance = await accountService.getBalanceById(sender.id!)
            const receiverBalance = await accountService.getBalanceById(receiver.id!)

            expect(senderBalance).toBe(0)
            expect(receiverBalance).toBe(1500)
        })

        it('створює кілька транзакцій послідовно', async () => {
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 100)
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 200)
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 150)

            const senderBalance = await accountService.getBalanceById(sender.id!)
            const receiverBalance = await accountService.getBalanceById(receiver.id!)

            expect(senderBalance).toBe(550)
            expect(receiverBalance).toBe(950)

            const allTransactions = await transactionService.getAll()
            expect(allTransactions).toHaveLength(3)
        })
    })

    describe('getAllByPeriod', () => {
        it('повертає транзакції за період', async () => {
            const now = new Date()
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

            await transactionService.insert(sender.id!, receiver.id!, categoryId, 100)

            const transactions = await transactionService.getAllByPeriod(
                sender.id!,
                yesterday,
                tomorrow
            )

            expect(transactions).toHaveLength(1)
            expect(transactions[0].senderId).toBe(sender.id)
        })

        it('повертає порожній масив для періоду без транзакцій', async () => {
            const pastDate = new Date('2020-01-01')
            const pastDateEnd = new Date('2020-01-31')

            const transactions = await transactionService.getAllByPeriod(
                sender.id!,
                pastDate,
                pastDateEnd
            )

            expect(transactions).toHaveLength(0)
        })

        it('включає транзакції де користувач є отримувачем', async () => {
            const now = new Date()
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

            await transactionService.insert(sender.id!, receiver.id!, categoryId, 100)

            const transactions = await transactionService.getAllByPeriod(
                receiver.id!,
                yesterday,
                tomorrow
            )

            expect(transactions).toHaveLength(1)
            expect(transactions[0].receiverId).toBe(receiver.id)
        })

        it('фільтрує транзакції за точними межами періоду', async () => {
            const baseDate = new Date('2024-01-15T12:00:00')
            const startDate = new Date('2024-01-01T00:00:00')
            const endDate = new Date('2024-01-31T23:59:59')

            vi.spyOn(Date, 'now').mockReturnValue(baseDate.getTime())

            await transactionService.insert(sender.id!, receiver.id!, categoryId, 100)

            vi.spyOn(Date, 'now').mockRestore()

            const transactions = await transactionService.getAllByPeriod(
                sender.id!,
                startDate,
                endDate
            )

            expect(transactions).toHaveLength(1)
        })

        it('повертає кілька транзакцій за період', async () => {
            const now = new Date()
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

            await transactionService.insert(sender.id!, receiver.id!, categoryId, 100)
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 200)
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 150)

            const transactions = await transactionService.getAllByPeriod(
                sender.id!,
                yesterday,
                tomorrow
            )

            expect(transactions).toHaveLength(3)
        })
    })

    describe('getStatsByCategories', () => {
        it('розраховує статистику по категоріям', async () => {
            const category1 = 'category-1'
            const category2 = 'category-2'

            const now = new Date()
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

            await transactionService.insert(sender.id!, receiver.id!, category1, 100)
            await transactionService.insert(sender.id!, receiver.id!, category1, 50)

            await transactionService.insert(receiver.id!, sender.id!, category2, 200)

            const stats = await transactionService.getStatsByCategories(
                sender.id!,
                yesterday,
                tomorrow
            )

            expect(stats[category1]).toEqual({ income: 0, expense: 150 })
            expect(stats[category2]).toEqual({ income: 200, expense: 0 })
        })

        it('повертає порожній об\'єкт для періоду без транзакцій', async () => {
            const pastDate = new Date('2020-01-01')
            const pastDateEnd = new Date('2020-01-31')

            const stats = await transactionService.getStatsByCategories(
                sender.id!,
                pastDate,
                pastDateEnd
            )

            expect(stats).toEqual({})
        })

        it('обробляє кілька категорій одночасно', async () => {
            const cat1 = 'cat-1'
            const cat2 = 'cat-2'
            const cat3 = 'cat-3'

            const now = new Date()
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

            await transactionService.insert(sender.id!, receiver.id!, cat1, 100)
            await transactionService.insert(receiver.id!, sender.id!, cat2, 50)
            await transactionService.insert(sender.id!, receiver.id!, cat3, 75)

            const stats = await transactionService.getStatsByCategories(
                sender.id!,
                yesterday,
                tomorrow
            )

            expect(stats[cat1]).toEqual({ income: 0, expense: 100 })
            expect(stats[cat2]).toEqual({ income: 50, expense: 0 })
            expect(stats[cat3]).toEqual({ income: 0, expense: 75 })
        })

        it('агрегує кілька транзакцій в одній категорії', async () => {
            const category = 'test-category'

            const now = new Date()
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

            await transactionService.insert(sender.id!, receiver.id!, category, 100)
            await transactionService.insert(sender.id!, receiver.id!, category, 200)

            await transactionService.insert(receiver.id!, sender.id!, category, 150)
            await transactionService.insert(receiver.id!, sender.id!, category, 50)

            const stats = await transactionService.getStatsByCategories(
                sender.id!,
                yesterday,
                tomorrow
            )

            expect(stats[category]).toEqual({ income: 200, expense: 300 })
        })
    })

    describe('getByCategoryId', () => {
        it('повертає транзакції по ID категорії', async () => {
            const category1 = 'category-1'
            const category2 = 'category-2'

            await transactionService.insert(sender.id!, receiver.id!, category1, 100)
            await transactionService.insert(sender.id!, receiver.id!, category2, 200)
            await transactionService.insert(sender.id!, receiver.id!, category1, 150)

            const transactions = await transactionService.getByCategoryId(category1)

            expect(transactions).toHaveLength(2)
            expect(transactions[0].categoryId).toBe(category1)
            expect(transactions[1].categoryId).toBe(category1)
        })

        it('повертає порожній масив для неіснуючої категорії', async () => {
            await transactionService.insert(sender.id!, receiver.id!, 'cat-1', 100)

            const transactions = await transactionService.getByCategoryId('non-existent-category')

            expect(transactions).toHaveLength(0)
        })

        it('повертає всі транзакції однієї категорії', async () => {
            const category = 'single-category'

            await transactionService.insert(sender.id!, receiver.id!, category, 100)
            await transactionService.insert(sender.id!, receiver.id!, category, 200)
            await transactionService.insert(sender.id!, receiver.id!, category, 300)

            const transactions = await transactionService.getByCategoryId(category)

            expect(transactions).toHaveLength(3)
            expect(transactions.every(tx => tx.categoryId === category)).toBe(true)
        })
    })

    describe('getByAmount', () => {
        it('повертає транзакції по сумі', async () => {
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 100)
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 200)
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 100)

            const transactions = await transactionService.getByAmount(100)

            expect(transactions).toHaveLength(2)
            expect(transactions.every(tx => tx.amount === 100)).toBe(true)
        })

        it('повертає порожній масив для неіснуючої суми', async () => {
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 100)

            const transactions = await transactionService.getByAmount(999)

            expect(transactions).toHaveLength(0)
        })

        it('знаходить транзакції з великими сумами', async () => {
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 999)

            const transactions = await transactionService.getByAmount(999)

            expect(transactions).toHaveLength(1)
            expect(transactions[0].amount).toBe(999)
        })
    })

    describe('getByDate', () => {
        it('повертає транзакції по конкретній даті', async () => {
            const targetDate = new Date('2024-03-15T10:30:00')

            vi.spyOn(Date, 'now').mockReturnValue(targetDate.getTime())

            await transactionService.insert(sender.id!, receiver.id!, categoryId, 100)

            vi.spyOn(Date, 'now').mockRestore()

            const transactions = await transactionService.getByDate(targetDate)

            expect(transactions).toHaveLength(1)
        })

        it('повертає порожній масив для дати без транзакцій', async () => {
            const futureDate = new Date('2030-01-01')

            const transactions = await transactionService.getByDate(futureDate)

            expect(transactions).toHaveLength(0)
        })

        it('ігнорує час, враховує тільки дату', async () => {
            const date1 = new Date('2024-03-15T08:00:00')
            const date2 = new Date('2024-03-15T20:00:00')

            vi.spyOn(Date, 'now').mockReturnValue(date1.getTime())
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 100)

            vi.spyOn(Date, 'now').mockRestore()

            const transactions = await transactionService.getByDate(date2)

            expect(transactions).toHaveLength(1)
        })

        it('знаходить кілька транзакцій в один день', async () => {
            const targetDate = new Date('2024-03-15T12:00:00')

            vi.spyOn(Date, 'now').mockReturnValue(targetDate.getTime())

            await transactionService.insert(sender.id!, receiver.id!, categoryId, 100)
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 200)
            await transactionService.insert(sender.id!, receiver.id!, categoryId, 300)

            vi.spyOn(Date, 'now').mockRestore()

            const transactions = await transactionService.getByDate(targetDate)

            expect(transactions).toHaveLength(3)
        })
    })

    describe('update', () => {
        it('завжди повертає false (транзакції не можна оновлювати)', async () => {
            const result = await transactionService.update()

            expect(result).toBe(false)
        })
    })

    describe('Integration tests', () => {
        it('комплексний сценарій: створення, пошук та статистика', async () => {
            const cat1 = 'groceries'
            const cat2 = 'entertainment'

            const now = new Date()
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

            await transactionService.insert(sender.id!, receiver.id!, cat1, 100)
            await transactionService.insert(sender.id!, receiver.id!, cat2, 200)
            await transactionService.insert(receiver.id!, sender.id!, cat1, 50)

            const all = await transactionService.getAll()
            expect(all).toHaveLength(3)

            const cat1Transactions = await transactionService.getByCategoryId(cat1)
            expect(cat1Transactions).toHaveLength(2)

            const stats = await transactionService.getStatsByCategories(
                sender.id!,
                yesterday,
                tomorrow
            )

            expect(stats[cat1].expense).toBe(100)
            expect(stats[cat1].income).toBe(50)
            expect(stats[cat2].expense).toBe(200)

            const senderBalance = await accountService.getBalanceById(sender.id!)
            const receiverBalance = await accountService.getBalanceById(receiver.id!)

            expect(senderBalance).toBe(750)
            expect(receiverBalance).toBe(750)
        })

        it('обробляє багато транзакцій між кількома користувачами', async () => {
            const thirdUser = await accountService.insert(
                'Third',
                'User',
                'third@test.com',
                'password',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                1000
            )

            await transactionService.insert(sender.id!, receiver.id!, 'cat1', 100)
            await transactionService.insert(sender.id!, thirdUser.id!, 'cat2', 200)
            await transactionService.insert(receiver.id!, thirdUser.id!, 'cat1', 150)
            await transactionService.insert(thirdUser.id!, sender.id!, 'cat3', 50)

            const allTransactions = await transactionService.getAll()
            expect(allTransactions).toHaveLength(4)

            const senderBalance = await accountService.getBalanceById(sender.id!)
            const receiverBalance = await accountService.getBalanceById(receiver.id!)
            const thirdBalance = await accountService.getBalanceById(thirdUser.id!)

            expect(senderBalance).toBe(750)
            expect(receiverBalance).toBe(450)
            expect(thirdBalance).toBe(1300)
        })
    })
})