"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//CONSOLE FUNCTIONS - DEBUGGING
const chalk_1 = __importDefault(require("chalk"));
const print_success_status = (text) => {
    console.log(chalk_1.default.underline.bgGreen.black(text));
};
const print_error_status = (text) => {
    console.log(chalk_1.default.underline.bgRed.white(text));
};
const print_success_login = (text) => {
    console.log(chalk_1.default.underline.bgBlue.black('+') + chalk_1.default.underline.bgGreenBright.black(text));
};
const print_error_login = (text) => {
    console.log(chalk_1.default.underline.bgBlue.black('+') + chalk_1.default.underline.bgRedBright.black(text));
};
const print_general_status = (text) => {
    console.log(chalk_1.default.underline.bgWhite.black(text));
};
const print_connection_established = (text) => {
    console.log(chalk_1.default.underline.bgBlue.black(text));
};
const print_socket_attached = (text) => {
    console.log(chalk_1.default.underline.bgGreen.black('+') + chalk_1.default.underline.bgBlue.black(text));
};
const print_socket_detached = (text) => {
    console.log(chalk_1.default.underline.bgRed.black('-') + chalk_1.default.underline.bgRed.black(text));
};
const { log } = console;
function proxiedLog(...args) {
    //@ts-ignore
    const line = (((new Error('log'))
        .stack.split('\n')[2] || '…')
        .match(/\(([^)]+)\)/) || [, 'not found'])[1];
    log.call(console, `${line}\n`, ...args);
}
console.info = proxiedLog;
const print_line = (text) => {
    console.info(text);
};
exports.default = {
    print_success_status,
    print_error_status,
    print_success_login,
    print_error_login,
    print_general_status,
    print_connection_established,
    print_socket_attached,
    print_socket_detached,
    print_line
};
