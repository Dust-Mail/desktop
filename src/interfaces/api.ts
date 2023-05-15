import { Result } from "./result";

import { ApiSettings, User } from "@src/models";

export default interface ApiClient {
	getChangelog: () => Promise<Result<string>>;
	getSettings: (baseUrl?: string) => Promise<Result<ApiSettings>>;
	login: (
		baseUrl?: string,
		password?: string,
		username?: string
	) => Promise<Result<void>>;
	logout: () => Promise<Result<void>>;
	getUser: (baseUrl?: string) => Promise<Result<User>>;
}
