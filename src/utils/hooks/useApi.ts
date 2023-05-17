import useApiClient from "./useApiClient";
import useIsDesktop from "./useIsDesktop";
import useSettings from "./useSettings";

import { useCallback, useState } from "react";
import { useQuery } from "react-query";

import { ApiSettings, User } from "@models/api";
import { AppError } from "@models/error";

import { createResultFromUnknown } from "@utils/parseError";

export interface Api {
	isWorking: boolean;
	isLoggedIn: boolean;
	isFetching: boolean;
	error: AppError | null;
	sessionTokens: string[];
	settings: ApiSettings | null;
	login: (username?: string, password?: string) => Promise<void>;
	logout: () => Promise<void>;
}

const useApi = (baseUrl?: string): Api => {
	const [appSettings] = useSettings();

	const apiClient = useApiClient();

	const { usesApiForMail } = useIsDesktop();

	const enabled = usesApiForMail;

	baseUrl = baseUrl ?? appSettings.httpServerUrl ?? undefined;

	const [loginError, setLoginError] = useState<AppError | null>(null);

	// This value is immmediately set to false when the user logs in or out, before we even ask the server whether we are logged in or not
	const [couldBeLoggedIn, setCouldBeLoggedIn] = useState<boolean | null>(null);

	const {
		data: settings,
		error: settingsError,
		isLoading: isFetchingSettings
	} = useQuery<ApiSettings, AppError>(
		["apiSettings", baseUrl],
		async () => {
			const result = await apiClient
				.getSettings(baseUrl)
				.catch(createResultFromUnknown);

			if (result.ok) return result.data;
			else throw result.error;
		},
		{ retry: false, enabled }
	);

	const {
		data: user,
		error: userError,
		isLoading: isFetchingUser
	} = useQuery<User, AppError>(
		["apiUser", baseUrl],
		async () => {
			const result = await apiClient
				.getUser(baseUrl)
				.catch(createResultFromUnknown);

			if (result.ok) return result.data;
			else throw result.error;
		},
		{ retry: false, enabled }
	);

	const error = settingsError ?? userError ?? loginError;

	const isLoggedIn =
		couldBeLoggedIn !== null
			? couldBeLoggedIn
			: typeof user !== "string" && user?.loggedIn !== undefined;

	const sessionTokens =
		typeof user !== "string" && user?.loggedIn !== undefined
			? user.loggedIn.sessions
			: [];

	const isFetching = isFetchingSettings || isFetchingUser;

	const login = useCallback(
		async (username?: string, password?: string) => {
			setLoginError(null);
			const result = await apiClient
				.login(baseUrl, password, username)
				.catch(createResultFromUnknown);

			if (!result.ok) setLoginError(result.error);
			else setCouldBeLoggedIn(true);
		},
		[baseUrl]
	);

	const logout = useCallback(async () => {
		setLoginError(null);
		const result = await apiClient.logout().catch(createResultFromUnknown);

		if (!result.ok) setLoginError(result.error);
		else setCouldBeLoggedIn(false);
	}, []);

	return {
		isWorking: error === null,
		isLoggedIn,
		isFetching,
		error,
		sessionTokens,
		settings: settings ?? null,
		login,
		logout
	};
};

export default useApi;
