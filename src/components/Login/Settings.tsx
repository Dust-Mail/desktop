import { useDebounce } from "use-debounce";
import z from "zod";

import { repository } from "../../../package.json";

import { FC, useEffect } from "react";
import { useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Modal from "@mui/material/Modal";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import SettingsIcon from "@mui/icons-material/Settings";

import modalStyles from "@styles/modal";

import useApi from "@utils/hooks/useApi";
import useIsDesktop from "@utils/hooks/useIsDesktop";
import useSettings from "@utils/hooks/useSettings";
import useTheme from "@utils/hooks/useTheme";
import { errorToString } from "@utils/parseError";

const LoginSettingsMenu: FC = () => {
	const theme = useTheme();

	const [settings, setSetting] = useSettings();

	const [isOpen, setOpen] = useState(false);
	const [apiUrl, setApiUrl] = useState(settings.httpServerUrl ?? "");
	const [apiUrlDebounced] = useDebounce(apiUrl, 1000);
	const [password, setPassword] = useState("");

	const api = useApi(apiUrlDebounced);

	const { isDesktop } = useIsDesktop();

	useEffect(() => {
		if (!isOpen) setSetting("httpServerUrl", apiUrl);
	}, [isOpen]);

	return (
		<>
			<Box
				sx={{
					position: "absolute",
					right: theme.spacing(2),
					top: theme.spacing(2)
				}}
			>
				<IconButton
					onClick={() => setOpen(true)}
					aria-label="Open custom server settings"
				>
					<SettingsIcon />
				</IconButton>
			</Box>
			{isOpen && (
				<Modal onClose={() => setOpen(false)} open={isOpen}>
					<Box sx={modalStyles(theme)}>
						<Stack direction="column" spacing={2}>
							<Typography variant="h5">
								Set custom {import.meta.env.VITE_APP_NAME} backend server
							</Typography>

							<Box>
								<Typography
									color={theme.palette.text.secondary}
									variant="subtitle1"
								>
									Only update this value if you know what you are doing!
								</Typography>

								<Typography
									color={theme.palette.text.secondary}
									variant="subtitle1"
								>
									For more information visit{" "}
									<Link href={repository.url} target="_blank" rel="noreferrer">
										the Github repo
									</Link>
									.
								</Typography>
							</Box>

							{isDesktop && (
								<Box>
									<Typography
										color={theme.palette.text.secondary}
										variant="subtitle1"
									>
										Because you are using the desktop version of{" "}
										{import.meta.env.VITE_APP_NAME}, you do not need a backend
										server (unless you want to login using oAuth). But you can
										still switch over to using one to fetch your mail, instead
										of your desktop client connecting to the mail server.
									</Typography>

									<ListItem>
										<ListItemText
											id="switch-desktop-api-use"
											primary="Use backend server to fetch mail"
										/>
										<Switch
											edge="end"
											onChange={() =>
												setSetting("useApiOnDesktop", !settings.useApiOnDesktop)
											}
											checked={settings.useApiOnDesktop}
											inputProps={{
												"aria-labelledby": "switch-desktop-api-use"
											}}
										/>
									</ListItem>
								</Box>
							)}

							<Stack direction="row" spacing={2}>
								<FormControl fullWidth variant="outlined">
									<InputLabel htmlFor="custom-server">
										Custom server url/path
									</InputLabel>
									<OutlinedInput
										onChange={(e) =>
											setApiUrl(z.string().parse(e.currentTarget.value))
										}
										value={apiUrl}
										disabled={api.isLoggedIn}
										id="custom-server"
										label="Custom server url/path"
										type="text"
										endAdornment={
											<InputAdornment position="end">
												{api.error !== null && <ErrorIcon color="error" />}
												{api.settings !== null && api.error === null && (
													<CheckIcon color="success" />
												)}
												{api.isFetching && <CircularProgress />}
											</InputAdornment>
										}
									/>
								</FormControl>
								{/* <IconButton
									disabled={userIsLoggedIn}
									onClick={() => fetchApiSettings(apiUrl)}
								>
									<RefreshIcon />
								</IconButton> */}
							</Stack>
							{api.settings?.authorization && (
								<Stack direction="column">
									<TextField
										fullWidth
										onChange={(e) =>
											setPassword(z.string().parse(e.currentTarget.value))
										}
										value={password}
										disabled={api.isLoggedIn}
										id="password"
										required
										label="Password for server"
										variant="outlined"
										type="password"
									/>
								</Stack>
							)}

							{api.error !== null && (
								<Alert severity="error">{errorToString(api.error)}</Alert>
							)}

							{api.isLoggedIn && api.error === null && (
								<Alert severity="success">
									Currently logged in to &quot;{apiUrl}&quot;
								</Alert>
							)}

							<Button
								onClick={async () => {
									if (api.isLoggedIn) {
										await api.logout();
									} else {
										await api.login(undefined, password);

										setSetting("httpServerUrl", apiUrl);
									}
								}}
								fullWidth
								variant="contained"
							>
								{api.isLoggedIn ? "Logout" : "Login"}
							</Button>

							<Button
								onClick={() => setApiUrl(import.meta.env.VITE_DEFAULT_SERVER)}
								disabled={
									apiUrl == import.meta.env.VITE_DEFAULT_SERVER ||
									api.isLoggedIn
								}
							>
								Reset to default value
							</Button>
						</Stack>
					</Box>
				</Modal>
			)}
		</>
	);
};

export default LoginSettingsMenu;
