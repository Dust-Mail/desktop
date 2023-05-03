import {
	MailConfig,
	LoginConfiguration,
	MailBoxList,
	MailBox,
	Message,
	Preview,
	Version
} from "@src/models";

import { Result } from "@interfaces/result";

// TODO: Fully implement api specification

export default interface MailClient {
	getVersion: () => Promise<Result<Version>>;
	detectConfig: (emailAddress: string) => Promise<Result<MailConfig>>;
	login: (options: LoginConfiguration) => Promise<Result<string>>;
	logout: () => Promise<Result<void>>;
	get: (boxId?: string) => Promise<Result<MailBox>>;
	list: () => Promise<Result<MailBoxList>>;
	messageList: (page: number, boxId?: string) => Promise<Result<Preview[]>>;
	getMessage: (messageId?: string, boxId?: string) => Promise<Result<Message>>;
}
