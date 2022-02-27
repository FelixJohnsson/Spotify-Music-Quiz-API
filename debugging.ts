//CONSOLE FUNCTIONS - DEBUGGING
const chalk = require('chalk');

const print_success_status = (text:String) => {
	console.log(chalk.underline.bgGreen.black(text));
}
const print_error_status = (text:String) => {
	console.log(chalk.underline.bgRed.white(text));
}
const print_success_login = (text:String) => {
	console.log(chalk.underline.bgBlue.black('+') + chalk.underline.bgGreenBright.black(text));
}
const print_error_login = (text:String) => {
	console.log(chalk.underline.bgBlue.black('+') + chalk.underline.bgRedBright.black(text));
}
const print_general_status = (text:String) => {
	console.log(chalk.underline.bgWhite.black(text));
}
const print_connection_established = (text:String) => {
	console.log(chalk.underline.bgBlue.black(text));
}
const print_socket_attached = (text:String) => {
	console.log(chalk.underline.bgGreen.black('+') + chalk.underline.bgBlue.black(text));
}
const print_socket_detached = (text:String) => {
	console.log(chalk.underline.bgRed.black('-') + chalk.underline.bgRed.black(text));
}

const { log } = console;
function proxiedLog(...args:[]) {
	//@ts-ignore
  const line = (((new Error('log'))
    .stack.split('\n')[2] || '…')
    .match(/\(([^)]+)\)/) || [, 'not found'])[1];
  log.call(console, `${line}\n`, ...args);
}
console.info = proxiedLog;

const print_line = (text:String) => {
	console.info(text)
}

export default {
    print_success_status,
    print_error_status,
    print_success_login,
    print_error_login,
    print_general_status,
    print_connection_established,
    print_socket_attached,
    print_socket_detached,
    print_line
}