import { create } from "zustand";

import BaseConfiguration, { clean as cleanBase } from "./base";

import { MailConfig } from "@models/detect";
import {
	ConnectionSecurity,
	IncomingMailServerType,
	IncomingServerType,
	MailServerType,
	OutgoingMailServerType,
	OutgoingServerType,
	mailServerTypeList
} from "@models/login";

import { Result } from "@interfaces/result";

import parseEmail from "@utils/parseEmail";

export type PasswordBasedConfiguration = BaseConfiguration & {
	username: string;
	password: string;
};

export type ConfigurationMap = Record<
	MailServerType,
	PasswordBasedConfiguration
>;

const clean: PasswordBasedConfiguration = {
	...cleanBase,
	password: "",
	username: ""
};

const configurationsClean: ConfigurationMap = mailServerTypeList.reduce(
	(acc, item) => {
		acc[item] = clean;
		return acc;
	},
	{} as ConfigurationMap
);

export const defaultIncomingServer: IncomingMailServerType = "Imap" as const;
export const defaultOutgoingServer: OutgoingMailServerType = "Smtp" as const;

export const defaultPassword = "" as const;

export const defaultPorts: Record<MailServerType, number> = {
	Imap: 993,
	Pop: 995,
	Exchange: 443,
	Smtp: 465
} as const;

export const defaultSecuritySetting: ConnectionSecurity = "Tls";

export const createDefaultConfigurations: (
	username: string,
	host: string
) => Result<ConfigurationMap> = (username, host) => {
	const configurations: ConfigurationMap = mailServerTypeList.reduce(
		(acc, mailServerType) => {
			const mailServerTypeHost = [mailServerType.toLowerCase(), host].join(".");

			acc[mailServerType] = {
				host: mailServerTypeHost,
				port: defaultPorts[mailServerType],
				security: defaultSecuritySetting,
				username,
				password: defaultPassword
			};

			return acc;
		},
		{} as ConfigurationMap
	);

	return { ok: true, data: configurations };
};

interface PasswordBasedConfiguratorStore {
	provider: string;
	setProvider: (provider: string) => void;
	error: string | null;
	setError: (error: string | null) => void;
	menuOpen: boolean;
	setMenuOpen: (open: boolean) => void;
	configurations: ConfigurationMap;
	setPropertyInConfiguration: (
		mailServerType: MailServerType,
		property: keyof PasswordBasedConfiguration,
		value: string | number | null
	) => void;
	selectedConfiguration: {
		incoming: IncomingMailServerType;
		outgoing: OutgoingMailServerType;
	};
	setSelectedConfiguration(
		serverType: IncomingServerType,
		mailServerType: IncomingMailServerType
	): void;
	setSelectedConfiguration(
		serverType: OutgoingServerType,
		mailServerType: OutgoingMailServerType
	): void;
	clean: () => void;
	/**
	 * Set the inputs to their respective default values
	 */
	defaults: (emailAddress: string) => Result<void>;
	setConfiguration: (
		mailServerType: MailServerType,
		configuration: PasswordBasedConfiguration
	) => void;
	setConfigurations: (configurations: ConfigurationMap) => void;
}

const passwordBasedConfiguratorStore = create<PasswordBasedConfiguratorStore>(
	(set) => ({
		configurations: configurationsClean,
		setPropertyInConfiguration: (mailServerType, property, value) => {
			set((state) => {
				const currentConfiguration = state.configurations[mailServerType];

				return {
					error: null,
					configurations: {
						...state.configurations,
						[mailServerType]: { ...currentConfiguration, [property]: value }
					}
				};
			});
		},
		error: null,
		setError: (error) => set({ error }),
		provider: "",
		setProvider: (provider) => set({ provider }),
		menuOpen: false,
		setMenuOpen: (open) => set({ menuOpen: open }),
		selectedConfiguration: {
			incoming: defaultIncomingServer,
			outgoing: defaultOutgoingServer
		},
		setSelectedConfiguration: (serverType, mailServerType) => {
			switch (serverType) {
				case "incoming":
					set((current) => ({
						selectedConfiguration: {
							...current.selectedConfiguration,
							incoming: mailServerType as IncomingMailServerType
						}
					}));
					break;

				case "outgoing":
					set((current) => ({
						selectedConfiguration: {
							...current.selectedConfiguration,
							outgoing: mailServerType as OutgoingMailServerType
						}
					}));
					break;
			}
		},
		clean: () =>
			set({ provider: "", configurations: configurationsClean, error: null }),
		defaults: (emailAddress) => {
			const parseEmailResult = parseEmail(emailAddress);

			if (!parseEmailResult.ok) return parseEmailResult;

			const host = parseEmailResult.data.domain;
			const username = parseEmailResult.data.full;

			const defaultsResult = createDefaultConfigurations(username, host);

			if (!defaultsResult.ok) return defaultsResult;

			set({ configurations: defaultsResult.data, provider: host });

			return { ok: true, data: undefined };
		},
		setConfiguration: (mailServerType, configuration) =>
			set((current) => ({
				configurations: {
					...current.configurations,
					[mailServerType]: configuration
				}
			})),

		setConfigurations: (configurations: ConfigurationMap) =>
			set({ configurations })
	})
);

export const usePasswordBasedConfigurator = (): ((
	provider: string,
	configurations: Partial<ConfigurationMap>
) => void) => {
	const setShowMenu = passwordBasedConfiguratorStore(
		(state) => state.setMenuOpen
	);

	const setProvider = passwordBasedConfiguratorStore(
		(state) => state.setProvider
	);
	const setConfiguration = passwordBasedConfiguratorStore(
		(state) => state.setConfiguration
	);

	return (provider, configurations) => {
		setShowMenu(true);

		setProvider(provider);

		Object.entries(configurations).forEach(
			([mailServerType, configuration]) => {
				// Because the map is partial, we only set the configurations that actually exist
				setConfiguration(mailServerType as MailServerType, configuration);
			}
		);
	};
};

export const convertDetectedConfigToPasswordConfiguration = (
	username: string,
	detectedConfig: MailConfig
): Partial<ConfigurationMap> | null => {
	if (detectedConfig.type.multiServer === undefined) return null;

	const servers = detectedConfig.type.multiServer;

	const map: Partial<ConfigurationMap> = {};

	servers.incoming.forEach(
		({ domain: host, port, security, type: mailServerType }) => {
			map[mailServerType] = { host, port, username, password: "", security };
		}
	);

	servers.outgoing.forEach(
		({ domain: host, port, security, type: mailServerType }) => {
			map[mailServerType] = { host, port, username, password: "", security };
		}
	);

	return map;
};

export default passwordBasedConfiguratorStore;
