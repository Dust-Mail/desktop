import z from "zod";

export const UserModel = z
	.record(z.literal("loggedIn"), z.object({ sessions: z.string().array() }))
	.or(z.literal("noSession"));

export type User = z.infer<typeof UserModel>;
