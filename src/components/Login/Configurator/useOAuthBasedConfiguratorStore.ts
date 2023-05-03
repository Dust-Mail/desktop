import { create } from "zustand";

import BaseConfiguration, { clean as cleanBase } from "./base";

import { incomingPriorityList, outgoingPriorityList } from "@src/constants";

import { MailConfig, OAuth2Config } from "@models/detect";
import { IncomingMailServerType, OutgoingMailServerType } from "@models/login";

export type OAuthBasedConfiguration = BaseConfiguration & {
	username: string;
};

type IncomingOAuthBasedConfiguration = OAuthBasedConfiguration & {
	mailServerType: IncomingMailServerType;
};

type OutgoingOAuthBasedConfiguration = OAuthBasedConfiguration & {
	mailServerType: OutgoingMailServerType;
};

export type ConfigurationMap = {
	incoming: IncomingOAuthBasedConfiguration;
	outgoing: OutgoingOAuthBasedConfiguration;
};

const clean: OAuthBasedConfiguration = {
	...cleanBase,
	username: ""
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
	configuration: ConfigurationMap;
	setConfiguration: (configuration: ConfigurationMap) => void;
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
	configuration: ConfigurationMap;
	oAuthConfig: OAuth2Config;
}) => void) => {
	const setConfiguration = oAuthBasedConfiguratorStore(
		(state) => state.setConfiguration
	);
	const setProvider = oAuthBasedConfiguratorStore((state) => state.setProvider);
	const setDisplayName = oAuthBasedConfiguratorStore(
		(state) => state.setDisplayName
	);
	const setOAuthConfig = oAuthBasedConfiguratorStore(
		(state) => state.setOAuthConfig
	);

	const setShowMenu = oAuthBasedConfiguratorStore((state) => state.setMenuOpen);

	return (options) => {
		setShowMenu(true);

		setConfiguration(options.configuration);
		setProvider(options.provider);
		setDisplayName(options.displayName);
		setOAuthConfig(options.oAuthConfig);
	};
};

export const convertDetectedConfigToOAuthConfiguration = (
	username: string,
	detectedConfig: MailConfig
): ConfigurationMap | null => {
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
				mailServerType,
				security: foundServer.security,
				username
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
				mailServerType,
				security: foundServer.security,
				username
			};
		}
	}

	if (incomingServer === null || outgoingServer === null) return null;

	return { incoming: incomingServer, outgoing: outgoingServer };
};

export default oAuthBasedConfiguratorStore;
