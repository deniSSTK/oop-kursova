import CurrencyEnum from "../enums/CurrencyEnum";
import AccountRoleEnum from "../enums/AccountRolesEnum";

export const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidCurrency = (currency: string): boolean => {
    return Object.values(CurrencyEnum).includes(currency.toUpperCase() as CurrencyEnum);
};

export const isValidRole = (role: string): boolean => {
    return Object.values(AccountRoleEnum).includes(role.toUpperCase() as AccountRoleEnum);
};