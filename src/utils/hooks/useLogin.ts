import useIsDesktop from "./useIsDesktop";
import useMailClient from "./useMailClient";
import { useCurrentUser, useModifyUser } from "./useUser";

import { useNavigate } from "react-router-dom";

import { LoginConfiguration, Version } from "@src/models";

import { Result } from "@interfaces/result";

import compareVersions from "@utils/compareVersions";
import useStore from "@utils/hooks/useStore";
import {
	createBaseError,
	createResultFromUnknown,
	parseError
} from "@utils/parseError";

const getDisplayNameFromLoginConfiguration = (
	loginConfiguration: LoginConfiguration
): string => {
	return "";
};

const useLogin = (): ((
	config: LoginConfiguration
) => Promise<Result<void>>) => {
	const appVersion = useStore((state) => state.appVersion);
	const setFetching = useStore((state) => state.setFetching);

	const { isDesktop } = useIsDesktop();

	const mailClient = useMailClient();

	const modifyUser = useModifyUser();
	const [, setCurrentUser] = useCurrentUser();

	const navigate = useNavigate();

	return async (config) => {
		console.log(config);

		// Show the fetching animation
		setFetching(true);

		if (!isDesktop) {
			console.log("Checking if server version matches with client version...");

			const versionResponseResult = await mailClient
				.getVersion()
				.catch(createResultFromUnknown);

			if (!versionResponseResult.ok) {
				return versionResponseResult;
			}

			const { version: serverVersion, type: serverVersionType }: Version =
				versionResponseResult.data;

			const versionsMatch = compareVersions(serverVersion, appVersion.title);

			if (!versionsMatch) {
				setFetching(false);

				return createBaseError({
					message: `Server and client versions did not match, server has version ${serverVersion} (${serverVersionType}) while client has version ${appVersion.title} (${appVersion.type})`,
					kind: "VersionMismatch"
				});
			}
		}

		console.log("Sending login request...");

		// Request the login token
		const loginResult = await mailClient
			.login(config)
			// If there was anything wrong with the request, catch it
			.catch(parseError);

		setFetching(false);

		if (!loginResult.ok) {
			return loginResult;
		}

		const token = loginResult.data;

		const displayName = getDisplayNameFromLoginConfiguration(config);

		console.log("Successfully authorized with mail servers");

		modifyUser(token, { token, displayName });

		setCurrentUser(token);

		navigate(`/dashboard`);

		return { ok: true, data: undefined };
	};
};

export default useLogin;
