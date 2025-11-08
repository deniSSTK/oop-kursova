/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import Account from '../../src/entities/Account'
import CurrencyEnum from '../../src/enums/CurrencyEnum'
import AccountRoleEnum from '../../src/enums/AccountRolesEnum'
import fs from 'fs/promises'

vi.mock('argon2', () => ({
    default: {
        hash: vi.fn(),
        argon2id: 2
    },
    hash: vi.fn(),
    argon2id: 2
}))

import AccountService from "../../src/bll/services/AccountService"
import argon2 from 'argon2'

describe('AccountService', () => {
    let service: AccountService
    const testFileName = '/tests/accounts.test'

    beforeEach(async () => {
        vi.clearAllMocks()

        vi.spyOn(Account, 'fileName', 'get').mockReturnValue(testFileName)

        service = new AccountService()

        try {
            await fs.unlink(testFileName)
        } catch (e) {
        }
    })

    afterEach(async () => {
        try {
            await fs.unlink(testFileName)
        } catch (e) {}
    })

    describe('insert', () => {
        it('створює аккаунт із хешем пароля', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'Denis',
                'Tkachenko',
                'test@mail.com',
                '1234',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                500
            )

            expect(argon2.hash).toHaveBeenCalledWith('1234', {
                type: argon2.argon2id,
                timeCost: 3,
                memoryCost: 1 << 16,
                parallelism: 1,
            })
            expect(account.name).toBe('Denis')
            expect(account.secondName).toBe('Tkachenko')
            expect(account.email).toBe('test@mail.com')
            expect(account.balance).toBe(500)
            expect(account.passwordHash).toBe('hashed_pwd')
            expect(account.role).toBe(AccountRoleEnum.ACCOUNT)
            expect(account.currency).toBe(CurrencyEnum.UAH)
            expect(account.id).toBeDefined()
        })

        it('створює аккаунт без startBalance (за замовчуванням 0)', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'John',
                'Doe',
                'john@mail.com',
                'password123',
                CurrencyEnum.USD,
                AccountRoleEnum.ADMIN
            )

            expect(account.balance).toBe(0)
            expect(account.name).toBe('John')
            expect(account.role).toBe(AccountRoleEnum.ADMIN)
        })
    })

    describe('updateWithTarget', () => {
        it('оновлює ім\'я аккаунта', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'Jane',
                'Smith',
                'jane@mail.com',
                '1234',
                CurrencyEnum.EUR,
                AccountRoleEnum.ACCOUNT,
                100
            )

            const updatedAccount = await service.updateWithTarget(account.id!, 'Janet', 'name')

            expect(updatedAccount).not.toBeNull()
            expect(updatedAccount?.name).toBe('Janet')
            expect(updatedAccount?.secondName).toBe('Smith')
            expect(updatedAccount?.email).toBe('jane@mail.com')
        })

        it('оновлює прізвище аккаунта', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'John',
                'Doe',
                'john@mail.com',
                '1234',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                100
            )

            const updatedAccount = await service.updateWithTarget(account.id!, 'Johnson', 'secondName')

            expect(updatedAccount).not.toBeNull()
            expect(updatedAccount?.secondName).toBe('Johnson')
            expect(updatedAccount?.name).toBe('John')
        })

        it('оновлює email аккаунта', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'Alice',
                'Brown',
                'alice@mail.com',
                '1234',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                100
            )

            const updatedAccount = await service.updateWithTarget(account.id!, 'newemail@mail.com', 'email')

            expect(updatedAccount).not.toBeNull()
            expect(updatedAccount?.email).toBe('newemail@mail.com')
            expect(updatedAccount?.name).toBe('Alice')
        })

        it('повертає null для неіснуючого аккаунта', async () => {
            const updatedAccount = await service.updateWithTarget('non-existent-id', 'NewName', 'name')

            expect(updatedAccount).toBeNull()
        })
    })

    describe('updateBalance', () => {
        it('додає суму до балансу', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'John',
                'Doe',
                'john@mail.com',
                '1234',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                100
            )

            const updatedAccount = await service.updateBalance(account.id!, 50)

            expect(updatedAccount).not.toBeNull()
            expect(updatedAccount?.balance).toBe(150)
        })

        it('віднімає суму від балансу (від\'ємне значення)', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'Jane',
                'Smith',
                'jane@mail.com',
                '1234',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                200
            )

            const updatedAccount = await service.updateBalance(account.id!, -75)

            expect(updatedAccount).not.toBeNull()
            expect(updatedAccount?.balance).toBe(125)
        })

        it('встановлює нульовий баланс при відніманні всієї суми', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'Bob',
                'Wilson',
                'bob@mail.com',
                '1234',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                100
            )

            const updatedAccount = await service.updateBalance(account.id!, -100)

            expect(updatedAccount).not.toBeNull()
            expect(updatedAccount?.balance).toBe(0)
        })

        it('повертає null для неіснуючого аккаунта', async () => {
            const updatedAccount = await service.updateBalance('non-existent-id', 100)

            expect(updatedAccount).toBeNull()
        })
    })

    describe('getBalanceById', () => {
        it('повертає баланс по id', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'Jane',
                'Smith',
                'jane@mail.com',
                '1234',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                200
            )

            const balance = await service.getBalanceById(account.id!)
            expect(balance).toBe(200)
        })

        it('повертає оновлений баланс після змін', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'Tom',
                'Brown',
                'tom@mail.com',
                '1234',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                150
            )

            await service.updateBalance(account.id!, 50)
            const balance = await service.getBalanceById(account.id!)

            expect(balance).toBe(200)
        })

        it('повертає null для неіснуючого аккаунта', async () => {
            const balance = await service.getBalanceById('non-existent-id')

            expect(balance).toBeNull()
        })

        it('повертає 0 для аккаунта з нульовим балансом', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'Zero',
                'Balance',
                'zero@mail.com',
                '1234',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                0
            )

            const balance = await service.getBalanceById(account.id!)
            expect(balance).toBe(0)
        })
    })

    describe('Integration tests', () => {
        it('перевіряє повний цикл роботи з аккаунтом', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account = await service.insert(
                'Integration',
                'Test',
                'integration@mail.com',
                'password',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                1000
            )

            await service.updateWithTarget(account.id!, 'Updated', 'name')

            await service.updateBalance(account.id!, 500)

            const balance = await service.getBalanceById(account.id!)
            const accounts = await service.getAll()
            const updatedAccount = accounts.find(a => a.id === account.id)

            expect(balance).toBe(1500)
            expect(updatedAccount?.name).toBe('Updated')
            expect(updatedAccount?.secondName).toBe('Test')
        })

        it('працює з кількома аккаунтами одночасно', async () => {
            vi.mocked(argon2.hash).mockResolvedValue('hashed_pwd' as any)

            const account1 = await service.insert(
                'User1',
                'Last1',
                'user1@mail.com',
                'pass1',
                CurrencyEnum.UAH,
                AccountRoleEnum.ACCOUNT,
                100
            )

            const account2 = await service.insert(
                'User2',
                'Last2',
                'user2@mail.com',
                'pass2',
                CurrencyEnum.USD,
                AccountRoleEnum.ADMIN,
                200
            )

            await service.updateBalance(account1.id!, 50)
            await service.updateBalance(account2.id!, -50)

            const balance1 = await service.getBalanceById(account1.id!)
            const balance2 = await service.getBalanceById(account2.id!)

            expect(balance1).toBe(150)
            expect(balance2).toBe(150)
        })
    })
})