import OAuthBasedConfigurator from "./Configurator/OAuthBased";
import PasswordBasedConfigurator from "./Configurator/PasswordBased";
import {
	convertDetectedConfigToOAuthConfiguration,
	useOAuthBasedConfigurator
} from "./Configurator/useOAuthBasedConfiguratorStore";
import passwordBasedConfiguratorStore, {
	convertDetectedConfigToPasswordConfiguration,
	usePasswordBasedConfigurator
} from "./Configurator/usePasswordBasedConfiguratorStore";

// import passwordBasedConfiguratorStore from "./Configurator/usePasswordBasedConfiguratorStore";
import React, { useEffect, useState, FC, FormEvent } from "react";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import useApi from "@utils/hooks/useApi";
import useIsDesktop from "@utils/hooks/useIsDesktop";
import useMailClient from "@utils/hooks/useMailClient";
import useStore from "@utils/hooks/useStore";
import { createResultFromUnknown, errorToString } from "@utils/parseError";

const ConfigurationDetector: FC<{
	children: React.ReactNode;
	trailing?: React.ReactNode;
}> = ({ children, trailing }) => {
	const fetching = useStore((state) => state.fetching);
	const setFetching = useStore((state) => state.setFetching);

	const [username, setUsername] = useState("");
	const [displayName, setDisplayName] = useState("");

	const setPasswordBasedConfiguratorToDefaults = passwordBasedConfiguratorStore(
		(state) => state.defaults
	);

	const setShowPasswordBasedConfigurator = passwordBasedConfiguratorStore(
		(state) => state.setMenuOpen
	);

	const showOAuthBasedConfigurator = useOAuthBasedConfigurator();
	const showPasswordBasedConfigurator = usePasswordBasedConfigurator();

	const [error, setError] = useState<string | null>(null);

	const mailClient = useMailClient();

	const api = useApi();

	const { usesApiForMail } = useIsDesktop();

	useEffect(() => setError(null), [username, displayName]);

	useEffect(() => {
		document.title = `${import.meta.env.VITE_APP_NAME} - Login`;
	}, []);

	const missingFields = username.length == 0;

	const buttonShouldBeDisabled =
		missingFields ||
		fetching ||
		(usesApiForMail && (api.isFetching || !api.isWorking));

	/**
	 * Runs when the form should be submitted to the server
	 */
	const onSubmit = async (e?: FormEvent): Promise<void> => {
		if (e) e.preventDefault();

		// Reject the form if there any fields empty
		if (missingFields) {
			setError("Missing required fields");
			return;
		}

		// Set the password based configurator fields to the default state, in case anything goes wrong detecting the config from the email address
		setPasswordBasedConfiguratorToDefaults(username);

		setFetching(true);

		const configResult = await mailClient
			.detectConfig(username)
			.catch(createResultFromUnknown);

		setFetching(false);

		if (!configResult.ok) {
			const error = errorToString(configResult.error);

			setError(error);

			return;
		}

		const config = configResult.data;

		const provider = config.provider;

		if (config.oauth2 !== null) {
			const oAuthConfig = config.oauth2;
			const displayName = config.displayName;

			const oAuthBasedConfigurations =
				convertDetectedConfigToOAuthConfiguration(config);

			if (oAuthBasedConfigurations === null) {
				setError("Failed to parse detected config into fields");
				return;
			}

			showOAuthBasedConfigurator({
				provider,
				displayName,
				username,
				oAuthConfig,
				configuration: oAuthBasedConfigurations
			});
		} else {
			const passwordBasedConfigurations =
				convertDetectedConfigToPasswordConfiguration(username, config);

			if (passwordBasedConfigurations === null) {
				setError("Failed to parse detected config into fields");
				return;
			}

			showPasswordBasedConfigurator(provider, passwordBasedConfigurations);
		}
	};

	return (
		<Stack direction="column" spacing={2}>
			<form onSubmit={onSubmit}>
				<Stack direction="column" spacing={2}>
					{children}

					<TextField
						onChange={(e) => setDisplayName(e.currentTarget.value)}
						id="display-name"
						value={displayName}
						label="Display name"
						placeholder="The name shown when you send a message"
						variant="outlined"
						type="text"
					/>

					<TextField
						required
						onChange={(e) => setUsername(e.currentTarget.value)}
						id="email"
						value={username}
						label="Email address"
						variant="outlined"
						type="email"
					/>

					<Button
						fullWidth
						disabled={buttonShouldBeDisabled}
						type="submit"
						variant="contained"
					>
						Next
					</Button>
					{error === null && !api.isWorking && usesApiForMail && (
						<Alert sx={{ textAlign: "left" }} severity="warning">
							<AlertTitle>Warning</AlertTitle>The currently set Dust-Mail
							backend server is not working. Please configure it using the
							settings icon in the top right.
						</Alert>
					)}
					{error && (
						<>
							<Alert sx={{ textAlign: "left" }} severity="error">
								<AlertTitle>Error</AlertTitle>
								{error}
							</Alert>
							<Button
								fullWidth
								variant="text"
								onClick={() => {
									setPasswordBasedConfiguratorToDefaults(username);
									setShowPasswordBasedConfigurator(true);
								}}
							>
								Continue to configuration menu anyway
							</Button>
						</>
					)}
				</Stack>
			</form>
			{trailing}
			<OAuthBasedConfigurator />
			<PasswordBasedConfigurator />
		</Stack>
	);
};

export default ConfigurationDetector;
