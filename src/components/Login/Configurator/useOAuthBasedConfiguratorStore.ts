import { create } from "zustand";

import BaseConfiguration, {
	clean as cleanBase,
	convertToRemoteServer
} from "./base";

import { incomingPriorityList, outgoingPriorityList } from "@src/constants";

import { MailConfig, OAuth2Config } from "@models/detect";
import {
	Credentials,
	IncomingEmailProtocol,
	IncomingMailServerType,
	LoginConfiguration,
	OutgoingEmailProtocol,
	OutgoingMailServerType
} from "@models/login";

type IncomingOAuthBasedConfiguration = BaseConfiguration & {
	mailServerType: IncomingMailServerType;
};

type OutgoingOAuthBasedConfiguration = {
	mailServerType: OutgoingMailServerType;
} & BaseConfiguration;

export type OAuthConfigurationMap = {
	incoming: IncomingOAuthBasedConfiguration;
	outgoing: OutgoingOAuthBasedConfiguration;
};

const clean: BaseConfiguration = {
	...cleanBase
};

interface OAuthBasedConfiguratorStore {
	menuOpen: boolean;
	setMenuOpen: (open: boolean) => void;
	displayName: string;
	setDisplayName: (displayName: string) => void;
	oAuthConfig?: OAuth2Config;
	setOAuthConfig: (config: OAuth2Config) => void;
	provider: string;
	setProvider: (provider: string) => void;
	username: string;
	setUsername: (username: string) => void;
	configuration: OAuthConfigurationMap;
	setConfiguration: (configuration: OAuthConfigurationMap) => void;
}

const oAuthBasedConfiguratorStore = create<OAuthBasedConfiguratorStore>(
	(set) => ({
		menuOpen: false,
		setMenuOpen: (open) => set({ menuOpen: open }),
		displayName: "",
		setDisplayName: (displayName) => set({ displayName }),
		oAuthConfig: undefined,
		setOAuthConfig: (config) => set({ oAuthConfig: config }),
		provider: "",
		setProvider: (provider) => set({ provider }),
		username: "",
		setUsername: (username) => set({ username }),
		configuration: {
			incoming: { ...clean, mailServerType: "Imap" },
			outgoing: { ...clean, mailServerType: "Smtp" }
		},
		setConfiguration: (configuration) => set({ configuration })
	})
);

export const useOAuthBasedConfigurator = (): ((options: {
	provider: string;
	displayName: string;
	username: string;
	configuration: OAuthConfigurationMap;
	oAuthConfig: OAuth2Config;
}) => void) => {
	const setConfiguration = oAuthBasedConfiguratorStore(
		(state) => state.setConfiguration
	);
	const setProvider = oAuthBasedConfiguratorStore((state) => state.setProvider);
	const setDisplayName = oAuthBasedConfiguratorStore(
		(state) => state.setDisplayName
	);
	const setUsername = oAuthBasedConfiguratorStore((state) => state.setUsername);
	const setOAuthConfig = oAuthBasedConfiguratorStore(
		(state) => state.setOAuthConfig
	);

	const setShowMenu = oAuthBasedConfiguratorStore((state) => state.setMenuOpen);

	return (options) => {
		setShowMenu(true);

		setConfiguration(options.configuration);
		setUsername(options.username);
		setProvider(options.provider);
		setDisplayName(options.displayName);
		setOAuthConfig(options.oAuthConfig);
	};
};

export const convertDetectedConfigToOAuthConfiguration = (
	detectedConfig: MailConfig
): OAuthConfigurationMap | null => {
	if (detectedConfig.type.multiServer === undefined) return null;

	const servers = detectedConfig.type.multiServer;

	let incomingServer: IncomingOAuthBasedConfiguration | null = null;

	for (let i = 0; i < incomingPriorityList.length; i++) {
		const mailServerType = incomingPriorityList[i];

		const foundServer = servers.incoming.find(
			(server) => server.type === mailServerType
		);

		if (foundServer !== undefined) {
			incomingServer = {
				host: foundServer.domain,
				port: foundServer.port,
				security: foundServer.security,
				mailServerType
			};
		}
	}

	let outgoingServer: OutgoingOAuthBasedConfiguration | null = null;

	for (let i = 0; i < outgoingPriorityList.length; i++) {
		const mailServerType = outgoingPriorityList[i];

		const foundServer = servers.outgoing.find(
			(server) => server.type === mailServerType
		);

		if (foundServer !== undefined) {
			outgoingServer = {
				host: foundServer.domain,
				port: foundServer.port,
				security: foundServer.security,
				mailServerType
			};
		}
	}

	if (incomingServer === null || outgoingServer === null) return null;

	return { incoming: incomingServer, outgoing: outgoingServer };
};

export const convertToLoginConfiguration = (
	configuration: OAuthConfigurationMap,
	username: string,
	token: string
): LoginConfiguration => {
	let incoming: IncomingEmailProtocol;

	const oAuthCredentials: Credentials = { OAuth: { username, token } };

	const {
		mailServerType: incomingMailServerType,
		...incomingBaseConfiguration
	} = configuration.incoming;

	switch (incomingMailServerType) {
		case "Imap":
			incoming = {
				Imap: {
					server: convertToRemoteServer(incomingBaseConfiguration),
					credentials: oAuthCredentials
				}
			};
			break;
		case "Pop":
			incoming = {
				Pop: {
					server: convertToRemoteServer(incomingBaseConfiguration),
					credentials: oAuthCredentials
				}
			};
			break;
		case "Exchange":
			incoming = {
				Exchange: {
					server: convertToRemoteServer(incomingBaseConfiguration),
					credentials: oAuthCredentials
				}
			};
			break;
	}

	let outgoing: OutgoingEmailProtocol;

	const {
		mailServerType: outgoingMailServerType,
		...outgoingBaseConfiguration
	} = configuration.outgoing;

	switch (outgoingMailServerType) {
		case "Smtp":
			outgoing = {
				Smtp: {
					server: convertToRemoteServer(outgoingBaseConfiguration),
					credentials: oAuthCredentials
				}
			};
			break;
	}

	return {
		incoming,
		outgoing
	};
};

export default oAuthBasedConfiguratorStore;
