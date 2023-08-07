import { ConnectionSecurity, RemoteServer } from "@models/login";

export default interface BaseConfiguration {
	host: string;
	port: number;
	security: ConnectionSecurity;
}

export const convertToRemoteServer = (
	baseConfiguration: BaseConfiguration
): RemoteServer => {
	return {
		security: baseConfiguration.security,
		port: baseConfiguration.port,
		server: baseConfiguration.host
	};
};

export const clean: BaseConfiguration = {
	host: "",
	port: 0,
	security: "Plain"
};
