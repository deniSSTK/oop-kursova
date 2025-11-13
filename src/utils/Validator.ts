import CurrencyEnum from "../enums/CurrencyEnum";
import AccountRoleEnum from "../enums/AccountRolesEnum";

class Validator {
    isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    isValidCurrency = (currency: string): boolean => {
        return Object.values(CurrencyEnum).includes(currency.toUpperCase() as CurrencyEnum);
    };

    isValidRole = (role: string): boolean => {
        return Object.values(AccountRoleEnum).includes(role.toUpperCase() as AccountRoleEnum);
    };
}

export default Validator;