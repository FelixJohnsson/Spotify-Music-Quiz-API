//CONSOLE FUNCTIONS - DEBUGGING
import chalk from 'chalk'

export const print_success_status = (text: string) => {
    console.log(chalk.underline.bgGreen.black(text))
}
export const print_error_status = (text: string) => {
    console.log(chalk.underline.bgRed.white(text))
}
export const print_success_login = (text: string) => {
    console.log(chalk.underline.bgBlue.black('+') + chalk.underline.bgGreenBright.black(text))
}
export const print_error_login = (text: string) => {
    console.log(chalk.underline.bgBlue.black('+') + chalk.underline.bgRedBright.black(text))
}
export const print_general_status = (text: string) => {
    console.log(chalk.underline.bgWhite.black(text))
}
export const print_connection_established = (text: string) => {
    console.log(chalk.underline.bgBlue.black(text))
}
export const print_socket_attached = (text: string) => {
    console.log(chalk.underline.bgGreen.black('+') + chalk.underline.bgBlue.black(text))
}
export const print_socket_detached = (text: string) => {
    console.log(chalk.underline.bgRed.black('-') + chalk.underline.bgRed.black(text))
}

const { log } = console
function proxiedLog(...args: []) {
    //@ts-ignore
    const line = ((new Error('log').stack.split('\n')[2] || '…').match(/\(([^)]+)\)/) || [, 'not found'])[1]
    log.call(console, `${line}\n`, ...args)
}
console.info = proxiedLog

export const print_line = (text: string) => {
    console.info(text)
}
