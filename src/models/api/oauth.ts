import z from "zod";

export const OAuthStateModel = z.object({
	provider: z.string(),
	application: z.enum(["desktop", "web"])
});
export type OAuthState = z.infer<typeof OAuthStateModel>;

export const OAuthSessionModel = z.object({
	access_token: z.string(),
	token_type: z.string(),
	expires_in: z.number(),
	refresh_token: z.string().nullable()
});

export type OAuthSession = z.infer<typeof OAuthSessionModel>;
