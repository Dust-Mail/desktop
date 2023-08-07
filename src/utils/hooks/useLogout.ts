import useMailClient from "./useMailClient";
import useSelectedStore from "./useSelected";
import { useCurrentUser, useRemoveUser, useUsers } from "./useUser";

import { useCallback } from "react";

import useStore from "@utils/hooks/useStore";

const useLogout = (): (() => Promise<void>) => {
	const removeUser = useRemoveUser();

	const [users] = useUsers();

	const [currentUser, setCurrentUser] = useCurrentUser();

	const mailClient = useMailClient();

	const setSelectedBox = useSelectedStore((state) => state.setSelectedBox);

	const setFetching = useStore((state) => state.setFetching);

	const logout = useCallback(async (): Promise<void> => {
		setFetching(false);

		if (!currentUser || !users) return;

		await mailClient.logout();

		removeUser(currentUser?.token);

		const newCurrentUser = users
			.filter((user) => user.token != currentUser.token)
			?.shift();

		setCurrentUser(newCurrentUser?.token);

		if (newCurrentUser?.token) setSelectedBox();
	}, [users, currentUser, setFetching]);

	return logout;
};

export default useLogout;
