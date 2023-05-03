import oAuthBasedConfiguratorStore, {
	ConfigurationMap
} from "./useOAuthBasedConfiguratorStore";

import { FC, FormEventHandler, useMemo, useState } from "react";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

import { LoginConfiguration } from "@models/login";

import modalStyles from "@styles/modal";
import scrollbarStyles from "@styles/scrollbar";

import { useMailLogin } from "@utils/hooks/useLogin";
import useOAuth2Client from "@utils/hooks/useOAuth2Client";
import useTheme from "@utils/hooks/useTheme";
import { errorToString } from "@utils/parseError";

const OAuthBasedConfigurator: FC = () => {
	const theme = useTheme();

	const [modalSx, scrollBarSx] = useMemo(
		() => [modalStyles(theme), scrollbarStyles(theme)],
		[theme]
	);

	const menuOpen = oAuthBasedConfiguratorStore((state) => state.menuOpen);
	const setMenuOpen = oAuthBasedConfiguratorStore((state) => state.setMenuOpen);

	const provider = oAuthBasedConfiguratorStore((state) => state.provider);
	const displayName = oAuthBasedConfiguratorStore((state) => state.displayName);
	const oAuthConfig = oAuthBasedConfiguratorStore((state) => state.oAuthConfig);
	const configurations = oAuthBasedConfiguratorStore(
		(state) => state.configuration
	);

	const [error, setError] = useState<string | null>(null);

	const oAuthClient = useOAuth2Client();

	const login = useMailLogin();

	const createLoginConfiguration = (
		configurations: ConfigurationMap,
		accessToken: string
	): LoginConfiguration => {
		const {
			username,
			mailServerType: incomingMailServerType,
			host: domain,
			...incomingLoginConfiguration
		} = configurations.incoming;

		return {
			incoming: {
				...incomingLoginConfiguration,
				domain,
				loginType: { oAuthBased: { accessToken, username } }
			},
			incomingType: incomingMailServerType
		};
	};

	const onSubmit: FormEventHandler = async (e) => {
		e.preventDefault();

		setError(null);

		if (oAuthConfig === undefined) return;

		const oAuthSessionResult = await oAuthClient.getAccessToken(
			provider,
			oAuthConfig.oauthUrl,
			oAuthConfig.tokenUrl,
			oAuthConfig.scopes
		);

		if (!oAuthSessionResult.ok) {
			const error = errorToString(oAuthSessionResult.error);

			setError(error);

			return;
		}

		const oAuthSession = oAuthSessionResult.data;

		const loginConfiguration = createLoginConfiguration(
			configurations,
			oAuthSession.access_token
		);

		const loginResult = await login(loginConfiguration);

		if (!loginResult.ok) {
			const error = errorToString(loginResult.error);

			setError(error);

			return;
		}

		setMenuOpen(false);
	};

	const onClose = (): void => {
		setError(null);
		setMenuOpen(false);
	};

	return (
		<>
			<Modal open={menuOpen} onClose={onClose}>
				<Box
					sx={{
						...modalSx,
						...scrollBarSx,
						overflowY: "scroll",
						maxHeight: "90%"
					}}
				>
					<form onSubmit={onSubmit}>
						<Typography variant="h3" sx={{ textAlign: "center" }}>
							Login to {displayName}
						</Typography>

						{error !== null && (
							<Alert sx={{ textAlign: "left", mt: 2 }} severity="error">
								<AlertTitle>Error</AlertTitle>
								{error}
							</Alert>
						)}

						<Button fullWidth type="submit" sx={{ mt: 2 }} variant="contained">
							Login
						</Button>
					</form>
				</Box>
			</Modal>
		</>
	);
};

export default OAuthBasedConfigurator;
