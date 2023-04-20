import { Message } from "@src/models";

export default interface MessageAction {
	name: string;
	icon: JSX.Element;
	handler: (message: Message) => void;
}
