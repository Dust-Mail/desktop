import { ConfigurationMap } from "./usePasswordBasedConfiguratorStore";
import passwordBasedConfiguratorStore from "./usePasswordBasedConfiguratorStore";

import {
	FC,
	FormEventHandler,
	memo,
	useCallback,
	useMemo,
	useState
} from "react";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import {
	IncomingMailServerType,
	LoginConfiguration,
	LoginType,
	MailServerType,
	OutgoingMailServerType,
	ServerType,
	incomingMailServerTypeList,
	outgoingMailServerTypeList
} from "@models/login";

import modalStyles from "@styles/modal";
import scrollbarStyles from "@styles/scrollbar";

import { useMailLogin } from "@utils/hooks/useLogin";
import useStore from "@utils/hooks/useStore";
import useTheme from "@utils/hooks/useTheme";
import { errorToString } from "@utils/parseError";

const UnMemoizedPasswordBasedConfiguratorColumn: FC<{
	type: ServerType;
}> = ({ type }) => {
	const setSelectedConfiguration = passwordBasedConfiguratorStore(
		(state) => state.setSelectedConfiguration
	);
	const selectedConfiguration = passwordBasedConfiguratorStore(
		(state) => state.selectedConfiguration
	);

	const selectedMailServerType = selectedConfiguration[type];

	const identifier = `${type}-${selectedMailServerType}`;

	const mailServerTypeList = useMemo(() => {
		switch (type) {
			case "incoming":
				return incomingMailServerTypeList;

			case "outgoing":
				return outgoingMailServerTypeList;
		}
	}, []);

	const configuration = passwordBasedConfiguratorStore(
		(state) => state.configurations[selectedConfiguration[type]]
	);
	const setProperty = passwordBasedConfiguratorStore(
		(state) => state.setPropertyInConfiguration
	);

	const [showPassword, setShowPassword] = useState(false);

	return (
		<Grid item xs={12} md={6}>
			<Stack direction="column" spacing={2}>
				<Tabs
					value={selectedConfiguration[type]}
					aria-label="mail-server-type-tabs"
					onChange={(event: React.SyntheticEvent, newValue: MailServerType) => {
						switch (type) {
							case "incoming":
								setSelectedConfiguration(
									type,
									newValue as IncomingMailServerType
								);
								break;

							case "outgoing":
								setSelectedConfiguration(
									type,
									newValue as OutgoingMailServerType
								);
						}
					}}
					centered
				>
					{mailServerTypeList.map((item) => (
						<Tab id={`tab-${item}`} label={item} value={item} key={item} />
					))}
				</Tabs>
				<TextField
					fullWidth
					id={`${type}-server`}
					required
					onChange={(e) =>
						setProperty(selectedMailServerType, "host", e.target.value)
					}
					value={configuration.host}
					label="Host/ip"
					variant="outlined"
					type="text"
				/>

				<FormControl fullWidth>
					<InputLabel id={`${type}-server-security-label`}>Security</InputLabel>
					<Select
						labelId={`${type}-server-security-label`}
						id={`${type}-server-security`}
						required
						label="Security"
						value={configuration.security}
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						onChange={(e: any) => {
							if (
								"target" in e &&
								"value" in e.target &&
								typeof e.target.value == "string"
							) {
								setProperty(selectedMailServerType, "security", e.target.value);
							}
						}}
					>
						<MenuItem value="Plain">None (Not secure)</MenuItem>
						<MenuItem value="StartTls">STARTTLS (Upgrades to secure)</MenuItem>
						<MenuItem value="Tls">TLS (Secure)</MenuItem>
					</Select>
				</FormControl>

				<TextField
					fullWidth
					id={`${type}-server-port`}
					required
					onChange={(e) =>
						setProperty(
							selectedMailServerType,
							"port",
							parseInt(e.currentTarget.value)
						)
					}
					value={configuration.port}
					label="Port"
					helperText={`Default: ${
						type == "incoming"
							? configuration.security == "StartTls" ||
							  configuration.security == "Tls"
								? 993
								: 143
							: configuration.security == "StartTls"
							? 587
							: configuration.security == "Tls"
							? 465
							: 25
					}`}
					variant="outlined"
					type="number"
				/>

				<TextField
					required
					value={configuration.username}
					onChange={(e) => {
						setProperty(selectedMailServerType, "username", e.target.value);
					}}
					id={"username-" + identifier}
					label="Username"
					variant="outlined"
					type="email"
				/>

				<FormControl variant="outlined">
					<InputLabel htmlFor="password">Password</InputLabel>
					<OutlinedInput
						required
						onChange={(e) => {
							setProperty(selectedMailServerType, "password", e.target.value);
						}}
						endAdornment={
							<InputAdornment position="end">
								<Tooltip title={`${showPassword ? "Hide" : "Show"} password`}>
									<IconButton
										aria-label="toggle password visibility"
										onClick={() => setShowPassword((state) => !state)}
										onMouseDown={() => setShowPassword((state) => !state)}
										edge="end"
									>
										{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
									</IconButton>
								</Tooltip>
							</InputAdornment>
						}
						value={configuration.password}
						id={"password-" + identifier}
						label="Password"
						type={showPassword ? "text" : "password"}
					/>
				</FormControl>
			</Stack>
		</Grid>
	);
};

const PasswordBasedConfiguratorColumn = memo(
	UnMemoizedPasswordBasedConfiguratorColumn
);

const PasswordBasedConfigurator: FC = () => {
	const theme = useTheme();

	const [modalSx, scrollBarSx] = useMemo(
		() => [modalStyles(theme), scrollbarStyles(theme)],
		[theme]
	);

	const login = useMailLogin();

	const menuOpen = passwordBasedConfiguratorStore((state) => state.menuOpen);
	const setMenuOpen = passwordBasedConfiguratorStore(
		(state) => state.setMenuOpen
	);

	const error = passwordBasedConfiguratorStore((state) => state.error);
	const setError = passwordBasedConfiguratorStore((state) => state.setError);

	const fetching = useStore((state) => state.fetching);

	const selectedMailServerTypes = passwordBasedConfiguratorStore(
		(state) => state.selectedConfiguration
	);

	const configurations = passwordBasedConfiguratorStore(
		(state) => state.configurations
	);

	const provider = passwordBasedConfiguratorStore((state) => state.provider);

	const cleanFields = passwordBasedConfiguratorStore((state) => state.clean);

	const onClose = useCallback(() => {
		setMenuOpen(false);

		cleanFields();
	}, [cleanFields, setMenuOpen]);

	const missingFields = false;

	/**
	 * A function for converting from our selected mail server config to the credentials type that we use to login.
	 */
	const createLoginConfiguration = (
		configurations: ConfigurationMap,
		selectedConfigurations: {
			incoming: IncomingMailServerType;
			outgoing: OutgoingMailServerType;
		}
	): LoginConfiguration => {
		const incoming = configurations[selectedConfigurations.incoming];

		const {
			username: incomingUsername,
			password: incomingPassword,
			host: domain,
			...incomingConfiguration
		} = incoming;

		const incomingLoginType: LoginType = {
			passwordBased: {
				username: incomingUsername,
				password: incomingPassword
			}
		};

		const options: LoginConfiguration = {
			incoming: {
				...incomingConfiguration,
				domain,
				loginType: incomingLoginType
			},
			incomingType: selectedConfigurations.incoming
		};

		return options;
	};

	const onSubmit: FormEventHandler = async (e): Promise<void> => {
		e?.preventDefault();

		if (missingFields) {
			setError("Missing required fields");

			return;
		}

		const loginConfiguration = createLoginConfiguration(
			configurations,
			selectedMailServerTypes
		);

		const loginResult = await login(loginConfiguration);

		if (!loginResult.ok) {
			const error = errorToString(loginResult.error);

			setError(error);

			return;
		}

		onClose();
	};

	const buttonShouldBeDisabled = fetching || missingFields;

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
						<Typography variant="h5" textAlign="center">
							Login to {provider ?? "an unknown mail server"}
						</Typography>

						<>
							<Typography variant="subtitle1" textAlign="center">
								You can customize which mail servers that you want to connect to
								before actually logging in.
							</Typography>
							<Typography variant="subtitle1" textAlign="center">
								Don&apos;t know what any of this means? For most larger mail
								providers such as Google or Microsoft this will information will
								already be correct and you can just click on login.
							</Typography>
							<br />
							<Grid container spacing={2}>
								<PasswordBasedConfiguratorColumn type="incoming" />
								<PasswordBasedConfiguratorColumn type="outgoing" />
							</Grid>
						</>

						{error && (
							<Alert sx={{ textAlign: "left", mt: 2 }} severity="error">
								<AlertTitle>Error</AlertTitle>
								{error}
							</Alert>
						)}

						<Button
							disabled={buttonShouldBeDisabled}
							sx={{ mt: 2 }}
							fullWidth
							type="submit"
							variant="contained"
						>
							Login
						</Button>
					</form>
				</Box>
			</Modal>
		</>
	);
};

export default PasswordBasedConfigurator;
