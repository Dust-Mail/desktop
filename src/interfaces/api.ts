import { Result } from "./result";

import { ApiSettings } from "@src/models";

export default interface ApiClient {
	getChangelog: () => Promise<Result<string>>;
	getSettings: (baseUrl?: string) => Promise<Result<ApiSettings>>;
	login: (
		baseUrl?: string,
		password?: string,
		username?: string
	) => Promise<Result<void>>;
}
