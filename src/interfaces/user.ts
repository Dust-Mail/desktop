import { ServerType } from "@src/models";

export default interface User {
	id: string;
	usernames: Record<ServerType, string>;
	token: string;
}
