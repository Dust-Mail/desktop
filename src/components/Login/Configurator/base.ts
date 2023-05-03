import { ConnectionSecurity } from "@models/login";

export default interface BaseConfiguration {
	host: string;
	port: number;
	security: ConnectionSecurity;
}

export const clean: BaseConfiguration = {
	host: "",
	port: 0,
	security: "Plain"
};
