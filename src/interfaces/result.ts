import { AppError } from "@src/models";

export interface ErrorResult {
	ok: false;
	error: AppError;
}

export interface OkResult<T> {
	ok: true;
	data: T;
}

export type Result<T> = OkResult<T> | ErrorResult;
