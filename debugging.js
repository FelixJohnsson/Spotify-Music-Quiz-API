var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
//CONSOLE FUNCTIONS - DEBUGGING
var chalk = require('chalk');
var print_success_status = function (text) {
    console.log(chalk.underline.bgGreen.black(text));
};
var print_error_status = function (text) {
    console.log(chalk.underline.bgRed.white(text));
};
var print_success_login = function (text) {
    console.log(chalk.underline.bgBlue.black('+') + chalk.underline.bgGreenBright.black(text));
};
var print_error_login = function (text) {
    console.log(chalk.underline.bgBlue.black('+') + chalk.underline.bgRedBright.black(text));
};
var print_general_status = function (text) {
    console.log(chalk.underline.bgWhite.black(text));
};
var print_connection_established = function (text) {
    console.log(chalk.underline.bgBlue.black(text));
};
var print_socket_attached = function (text) {
    console.log(chalk.underline.bgGreen.black('+') + chalk.underline.bgBlue.black(text));
};
var print_socket_detached = function (text) {
    console.log(chalk.underline.bgRed.black('-') + chalk.underline.bgRed.black(text));
};
var log = console.log;
function proxiedLog() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    //@ts-ignore
    var line = (((new Error('log'))
        .stack.split('\n')[2] || '…')
        .match(/\(([^)]+)\)/) || [, 'not found'])[1];
    log.call.apply(log, __spreadArray([console, line + "\n"], args));
}
console.info = proxiedLog;
var print_line = function (text) {
    console.info(text);
};
module.exports = {
    print_success_status: print_success_status,
    print_error_status: print_error_status,
    print_success_login: print_success_login,
    print_error_login: print_error_login,
    print_general_status: print_general_status,
    print_connection_established: print_connection_established,
    print_socket_attached: print_socket_attached,
    print_socket_detached: print_socket_detached,
    print_line: print_line
};
