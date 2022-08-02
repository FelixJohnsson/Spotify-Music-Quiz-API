export interface Error_object {
	statusCode: number,
		error_message: string,
		content?: Record<string, any> | string | number,
}
export interface Success_object {
	statusCode: number,
	content?: Record<string, any> | string | number,
}