import { create } from "zustand";

import {
	useEffect,
	useRef,
	useState,
	memo,
	FC,
	useMemo,
	FormEvent
} from "react";
import { useInfiniteQuery } from "react-query";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";

import { messageCountForPage } from "@src/constants";
import { Preview, AppError } from "@src/models";

import { SortType, sortTypeList, sortTypeNiceNames } from "@models/sort";

import useMailClient from "@utils/hooks/useMailClient";
import useMessageActions from "@utils/hooks/useMessageActions";
import useSelectedBox from "@utils/hooks/useSelectedBox";
import useSelectedMessage from "@utils/hooks/useSelectedMessage";
import useStore from "@utils/hooks/useStore";
import useUser from "@utils/hooks/useUser";
import {
	createBaseError,
	createErrorFromUnknown,
	errorToString
} from "@utils/parseError";
import { sortPreviews } from "@utils/sort";

import MessageListItem from "@components/Message/ListItem";

interface RightClickMenuAnchor {
	x: number;
	y: number;
	id?: string;
}

interface MessageListStore {
	setFilter: (filter: string) => void;
	filter: string;
	setSortType: (sortType: SortType) => void;
	sortType: SortType;
}

const messageListStore = create<MessageListStore>((set) => ({
	setFilter: (filter) => set({ filter }),
	filter: "",
	setSortType: (sortType) => set({ sortType }),
	sortType: "date-descending"
}));

const UnMemoizedActionBar: FC<{
	refetch: () => void;
}> = ({ refetch }) => {
	const theme = useTheme();

	const [search, setSearch] = useState<string>("");

	const setFilter = messageListStore((state) => state.setFilter);
	const setSortType = messageListStore((state) => state.setSortType);
	const sortType = messageListStore((state) => state.sortType);

	const handleSubmit = (e: FormEvent): void => {
		e.preventDefault();

		setFilter(search);
	};

	useEffect(() => {
		if (search.length == 0) setFilter("");
	}, [search]);

	const label = "Search messages";

	const [sortMenuAnchorElement, setSortMenuAnchorElement] =
		useState<null | HTMLElement>(null);

	const [sortMenuOpen, setSortMenuOpen] = useState(false);

	const handleSortButtonClick = (
		event: React.MouseEvent<HTMLButtonElement>
	): void => {
		setSortMenuAnchorElement(event.currentTarget);
		setSortMenuOpen(true);
	};

	const handleSortMenuClose = (): void => {
		setSortMenuAnchorElement(null);
		setSortMenuOpen(false);
	};

	const handleSortMenuSelectChange = (
		event: React.ChangeEvent<HTMLInputElement>
	): void => {
		const newValue = event.currentTarget.value.toLowerCase() as SortType;

		if (sortTypeList.includes(newValue)) setSortType(newValue);

		setSortMenuOpen(false);
	};

	return (
		<>
			<Stack
				sx={{
					backgroundColor: theme.palette.background.default,
					borderBottom: `${theme.palette.divider} 1px solid`,
					width: 1,
					p: 2
				}}
				direction="row"
				alignItems="center"
				justifyContent="space-between"
			>
				<Box>
					<form onSubmit={handleSubmit}>
						<FormControl variant="outlined">
							<InputLabel size="small" htmlFor="search">
								{label}
							</InputLabel>
							<OutlinedInput
								endAdornment={
									<InputAdornment position="end">
										<Tooltip title="Clear">
											<IconButton
												sx={{
													visibility: search.length != 0 ? "visible" : "hidden"
												}}
												size="small"
												aria-label="clear input"
												onClick={() => {
													setSearch("");
												}}
												edge="end"
											>
												<CloseIcon />
											</IconButton>
										</Tooltip>
									</InputAdornment>
								}
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
								}}
								required
								size="small"
								id="search"
								label={label}
								type="text"
							/>
						</FormControl>

						<Tooltip title="Search">
							<IconButton onClick={() => setFilter(search)} sx={{ ml: 1 }}>
								<SearchIcon />
							</IconButton>
						</Tooltip>
					</form>
				</Box>

				<Box>
					<Menu
						id="sort-menu"
						anchorEl={sortMenuAnchorElement}
						open={sortMenuOpen}
						onClose={handleSortMenuClose}
						MenuListProps={{
							"aria-labelledby": "sort-menu"
						}}
					>
						<FormControl>
							<RadioGroup
								aria-labelledby="sort-menu-select-group"
								name="sort-menu-select-group"
								value={sortType}
								onChange={handleSortMenuSelectChange}
							>
								{sortTypeList.map((sortType) => (
									<MenuItem key={sortType}>
										<ListItemText>
											<FormControlLabel
												value={sortType}
												control={<Radio />}
												label={sortTypeNiceNames[sortType]}
											/>
										</ListItemText>
									</MenuItem>
								))}
							</RadioGroup>
						</FormControl>
					</Menu>
					<Tooltip title="Change message sorting">
						<IconButton onClick={handleSortButtonClick}>
							<SortIcon />
						</IconButton>
					</Tooltip>

					<Tooltip title="Refresh messages">
						<IconButton onClick={() => refetch()}>
							<RefreshIcon />
						</IconButton>
					</Tooltip>
				</Box>
			</Stack>
		</>
	);
};

const ActionBar = memo(UnMemoizedActionBar);

const UnMemoizedMessageListItems: FC<{
	data?: Preview[][];
	selectedMessageID?: string;
	setRightClickMenuAnchor: (anchor: RightClickMenuAnchor) => void;
}> = ({ data, selectedMessageID, setRightClickMenuAnchor }) => {
	if (data === undefined) return <></>;

	const sortType = messageListStore((state) => state.sortType);

	const sortedPreviews = sortPreviews(data.flat(), sortType);

	return (
		<>
			{sortedPreviews.map((message) => {
				const selected = selectedMessageID == message.id;

				return (
					<MessageListItem
						key={message.id}
						selectedMessage={selected}
						message={message}
						setRightClickMenuAnchor={setRightClickMenuAnchor}
					/>
				);
			})}
		</>
	);
};

const MessageListItems = memo(UnMemoizedMessageListItems);

const UnMemoizedMessageList: FC = () => {
	const mailClient = useMailClient();

	const setFetching = useStore((state) => state.setFetching);

	const filter = messageListStore((state) => state.filter);

	const { box: selectedBox } = useSelectedBox();
	const { selectedMessage } = useSelectedMessage();

	const user = useUser();

	// Request the messages using react-query
	const {
		data,
		error,
		fetchNextPage,
		isFetching,
		isFetchingNextPage,
		refetch
	} = useInfiniteQuery<Preview[], AppError>(
		["messageList", selectedBox?.id, filter],
		async ({ pageParam = 0 }) => {
			if (pageParam === false) {
				return [];
			}

			if (!selectedBox?.id) return [];

			const result = await mailClient
				.messageList(pageParam, selectedBox.id)
				.catch((error) => createBaseError(createErrorFromUnknown(error)));

			if (result.ok) return result.data;
			else throw result.error;
		},
		{
			getNextPageParam: (lastPage, pages) => {
				const morePagesExist = lastPage?.length === messageCountForPage;

				if (!morePagesExist) return false;

				return pages.length;
			},
			enabled:
				selectedBox?.id != undefined &&
				selectedBox.selectable &&
				user?.token != undefined
		}
	);

	useEffect(
		() => setFetching(isFetching || isFetchingNextPage),
		[isFetching, isFetchingNextPage]
	);

	const rightClickMenuBox = useRef(null);

	const [rightClickMenuAnchor, setRightClickMenuAnchor] =
		useState<RightClickMenuAnchor>({ x: 0, y: 0 });

	const messageActions = useMessageActions();

	const rightClickMenuOpen = useMemo(
		() => rightClickMenuAnchor.x != 0 || rightClickMenuAnchor.y != 0,
		[rightClickMenuAnchor, selectedMessage]
	);

	const handleMenuClose = (): void => setRightClickMenuAnchor({ x: 0, y: 0 });

	return (
		<>
			{rightClickMenuOpen && rightClickMenuBox && (
				<Menu
					id="message-context-menu"
					open={rightClickMenuOpen}
					onClose={handleMenuClose}
					anchorEl={rightClickMenuBox?.current}
					MenuListProps={{
						"aria-labelledby": "message-context-menu-button"
					}}
				>
					{messageActions.map((action) => (
						<MenuItem
							key={action.name}
							onClick={() => {
								handleMenuClose();
								if (!selectedMessage) return;
								action.handler(selectedMessage);
							}}
						>
							<ListItemIcon>{action.icon}</ListItemIcon>
							<ListItemText>{action.name}</ListItemText>
						</MenuItem>
					))}

					<MenuItem onClick={handleMenuClose}>
						<ListItemIcon>
							<CloseIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Close</ListItemText>
					</MenuItem>
				</Menu>
			)}

			<Box
				sx={{
					position: "absolute",
					width: "1px",
					height: "1px",
					left: rightClickMenuAnchor.x,
					top: rightClickMenuAnchor.y
				}}
				ref={rightClickMenuBox}
			/>

			<Box sx={{ display: selectedBox ? "block" : "none" }}>
				<ActionBar refetch={refetch} />
			</Box>

			<MessageListItems
				data={data?.pages}
				selectedMessageID={selectedMessage?.id}
				setRightClickMenuAnchor={setRightClickMenuAnchor}
			/>

			{(isFetching || isFetchingNextPage) && (
				<Box
					sx={{
						width: "100%",
						display: "flex",
						justifyContent: "center",
						my: 3
					}}
				>
					<CircularProgress />
				</Box>
			)}

			{!selectedBox?.id && (
				<Typography variant="h6" sx={{ textAlign: "center", mt: 1 }}>
					No mail box selected.
				</Typography>
			)}

			{error && (
				<Box sx={{ textAlign: "center", mt: 1, mx: 1 }}>
					<Typography variant="h6">{errorToString(error)}</Typography>

					<Button onClick={() => refetch()}>Retry</Button>
				</Box>
			)}

			{data && data.pages && data.pages[0].length == 0 && (
				<Typography variant="h6" sx={{ textAlign: "center", mt: 1 }}>
					Empty 🙃
				</Typography>
			)}

			{/* Show a load more button, unless the last page doesn't have a full set of items */}
			{data &&
				data.pages[data.pages.length - 1].length == messageCountForPage && (
					<Button fullWidth sx={{ mb: 1 }} onClick={() => fetchNextPage()}>
						Load More
					</Button>
				)}
		</>
	);
};

const MessageList = memo(UnMemoizedMessageList);

export default MessageList;
