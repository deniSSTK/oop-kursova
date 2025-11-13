import readline from 'readline';
import MainMenuLoop from "./menuLoops/MainMenuLoop";

import Parser from "../utils/Parsers";
import Validator from "../utils/Validator";

import AccountService from "../bll/services/AccountService";
import CategoryService from "../bll/services/CategoryService";
import TransactionService from "../bll/services/TransactionService";

import AccountMenuLoop from "./menuLoops/AccountMenuLoop";
import CategoryMenuLoop from "./menuLoops/CategoryMenuLoop";
import TransactionMenuLoop from "./menuLoops/TransactionMenuLoop";

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const parser = new Parser();
const validator = new Validator();

const accountService = new AccountService();
const categoryService = new CategoryService();
const transactionService = new TransactionService(accountService);

let menuLoop: MainMenuLoop;
const getMainLoop = () => menuLoop;

const accountMenuLoop = new AccountMenuLoop(validator, accountService, getMainLoop);
const categoryMenuLoop = new CategoryMenuLoop(categoryService, getMainLoop);
const transactionMenuLoop = new TransactionMenuLoop(parser, transactionService, getMainLoop);

menuLoop = new MainMenuLoop(accountMenuLoop, categoryMenuLoop, transactionMenuLoop);

menuLoop.start();