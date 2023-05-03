const useIsDesktop = (): boolean => {
	const isTauri: boolean = "__TAURI__" in window;

	return isTauri;
};

export default useIsDesktop;
