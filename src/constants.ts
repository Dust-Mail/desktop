import { IncomingMailServerType, OutgoingMailServerType } from "@models/login";

export const messageCountForPage =
	parseInt(import.meta.env.VITE_MESSAGE_COUNT_PAGE ?? "") || 20;

// These are in order of which mail server we prefer to connect to when when we have the option and the user is not choosing.
export const incomingPriorityList: IncomingMailServerType[] = [
	"Exchange",
	"Pop",
	"Imap"
];
export const outgoingPriorityList: OutgoingMailServerType[] = ["Smtp"];
