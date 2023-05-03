import z from "zod";

export const ConnectionSecurityModel = z.enum(["Tls", "StartTls", "Plain"]);

export type ConnectionSecurity = z.infer<typeof ConnectionSecurityModel>;

export const incomingMailServerTypeList = ["Imap", "Pop", "Exchange"] as const;
export const outgoingMailServerTypeList = ["Smtp"] as const;
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

export const IncomingServerTypeModel = z.literal(incomingServerTypeString);
export type IncomingServerType = z.infer<typeof IncomingServerTypeModel>;

export const OutgoingServerTypeModel = z.literal(outgoingServerTypeString);
export type OutgoingServerType = z.infer<typeof OutgoingServerTypeModel>;

export const ServerTypeModel = z.union([
	IncomingServerTypeModel,
	OutgoingServerTypeModel
]);
export type ServerType = z.infer<typeof ServerTypeModel>;

export const PasswordBasedLoginLiteral = "passwordBased" as const;
export const PasswordBasedLoginLiteralModel = z.literal(
	PasswordBasedLoginLiteral
);

export const OAuthBasedLoginLiteral = "oAuthBased" as const;
export const OAuthBasedLoginLiteralModel = z.literal(OAuthBasedLoginLiteral);

export const PasswordCredentialsModel = z.object({
	username: z.string(),
	password: z.string()
});
export type PasswordCredentials = z.infer<typeof PasswordCredentialsModel>;

export const OAuthCredentialsModel = z.object({
	username: z.string(),
	accessToken: z.string()
});
export type OAuthCredentials = z.infer<typeof OAuthCredentialsModel>;

export const LoginTypeModel = z.object({
	[PasswordBasedLoginLiteral]: PasswordCredentialsModel.optional(),
	[OAuthBasedLoginLiteral]: OAuthCredentialsModel.optional()
});

export type LoginType = z.infer<typeof LoginTypeModel>;

export const ServerLoginConfigurationModel = z.object({
	loginType: LoginTypeModel,
	domain: z.string(),
	port: z.number(),
	security: ConnectionSecurityModel
});
export type ServerLoginConfiguration = z.infer<
	typeof ServerLoginConfigurationModel
>;

export const LoginConfigurationModel = z.object({
	incoming: ServerLoginConfigurationModel,
	incomingType: IncomingMailServerTypeModel
});
export type LoginConfiguration = z.infer<typeof LoginConfigurationModel>;
