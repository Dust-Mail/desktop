import z from "zod";

export const ConnectionSecurityModel = z.enum(["Tls", "StartTls", "Plain"]);

export type ConnectionSecurity = z.infer<typeof ConnectionSecurityModel>;

export const imapMailServer = "Imap";
export const popMailServer = "Pop";
export const exchangeMailServer = "Exchange";

export const incomingMailServerTypeList = [
	imapMailServer,
	popMailServer,
	exchangeMailServer
] as const;

export const smtpMailServer = "Smtp";
export const outgoingMailServerTypeList = [smtpMailServer] as const;
export const mailServerTypeList = [
	...incomingMailServerTypeList,
	...outgoingMailServerTypeList
];

export const IncomingMailServerTypeModel = z.enum(incomingMailServerTypeList);
export type IncomingMailServerType = z.infer<
	typeof IncomingMailServerTypeModel
>;

export const OutgoingMailServerTypeModel = z.enum(outgoingMailServerTypeList);
export type OutgoingMailServerType = z.infer<
	typeof OutgoingMailServerTypeModel
>;

export const MailServerTypeModel = z.union([
	IncomingMailServerTypeModel,
	OutgoingMailServerTypeModel
]);
export type MailServerType = z.infer<typeof MailServerTypeModel>;

export const incomingServerTypeString = "incoming" as const;
export const outgoingServerTypeString = "outgoing" as const;
export const serverTypeList = [
	incomingServerTypeString,
	outgoingServerTypeString
] as const;
export const ServerTypeModel = z.enum(serverTypeList);
export type ServerType = z.infer<typeof ServerTypeModel>;

export const IncomingServerTypeModel = z.literal(incomingServerTypeString);
export type IncomingServerType = z.infer<typeof IncomingServerTypeModel>;

export const OutgoingServerTypeModel = z.literal(outgoingServerTypeString);
export type OutgoingServerType = z.infer<typeof OutgoingServerTypeModel>;

export const RemoteServerModel = z.object({
	server: z.string(),
	port: z.number(),
	security: ConnectionSecurityModel
});
export type RemoteServer = z.infer<typeof RemoteServerModel>;

export const password = "Password" as const;
export const oauth = "OAuth" as const;

export const PasswordCredentialsModel = z.object({
	username: z.string(),
	password: z.string()
});

export const OAuthCredentialsModel = z.object({
	username: z.string(),
	token: z.string()
});

export const CredentialsModel = z.union([
	z.object({ [password]: PasswordCredentialsModel }),
	z.object({ [oauth]: OAuthCredentialsModel })
]);
export type Credentials = z.infer<typeof CredentialsModel>;

export const ImapProtocolModel = z.object({
	server: RemoteServerModel,
	credentials: CredentialsModel
});
export type ImapProtocol = z.infer<typeof ImapProtocolModel>;

export const PopProtocolModel = z.object({
	server: RemoteServerModel,
	credentials: CredentialsModel
});
export type PopProtocol = z.infer<typeof PopProtocolModel>;

export const SmtpProtocolModel = z.object({
	server: RemoteServerModel,
	credentials: CredentialsModel
});
export type SmtpProtocol = z.infer<typeof SmtpProtocolModel>;

export const ExchangeProtocolModel = z.object({
	server: RemoteServerModel,
	credentials: CredentialsModel
});
export type ExchangeProtocol = z.infer<typeof ExchangeProtocolModel>;

export const IncomingEmailProtocolModel = z.union([
	z.object({ [imapMailServer]: ImapProtocolModel }),
	z.object({ [popMailServer]: PopProtocolModel }),
	z.object({ [exchangeMailServer]: ExchangeProtocolModel })
]);
export type IncomingEmailProtocol = z.infer<typeof IncomingEmailProtocolModel>;

export const OutgoingEmailProtocolModel = z.object({
	[smtpMailServer]: SmtpProtocolModel
});
export type OutgoingEmailProtocol = z.infer<typeof OutgoingEmailProtocolModel>;

export const LoginConfigurationModel = z.object({
	incoming: IncomingEmailProtocolModel,
	outgoing: OutgoingEmailProtocolModel
});
export type LoginConfiguration = z.infer<typeof LoginConfigurationModel>;
