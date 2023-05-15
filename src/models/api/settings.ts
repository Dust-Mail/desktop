import z from "zod";

export const ApiSettingsModel = z.object({
	authorization: z.boolean(),
	authorizationType: z.enum(["password", "user"]).nullable(),
	mailProxy: z.boolean()
});
export type ApiSettings = z.infer<typeof ApiSettingsModel>;
