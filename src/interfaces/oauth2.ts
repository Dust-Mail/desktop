import { Result } from "./result";

import { OAuthSession } from "@models/api";

export default interface OAuth2Client {
	getAccessToken: (
		providerName: string,
		grantUrl: string,
		tokenUrl: string,
		scopes: string[]
	) => Promise<Result<OAuthSession>>;
}
