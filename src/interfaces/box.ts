import { MailBox as ServerMailBox } from "@src/models";

type MailBox = ServerMailBox & { icon?: JSX.Element };

export default MailBox;
