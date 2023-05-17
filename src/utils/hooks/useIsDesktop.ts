import useSettings from "./useSettings";

const useIsDesktop = (): { isDesktop: boolean; usesApiForMail: boolean } => {
	const [settings] = useSettings();

	const isTauri: boolean = "__TAURI__" in window;

	const isDesktop = isTauri;

	const usesApiForMail = isDesktop ? settings.useApiOnDesktop : true;

	return { isDesktop, usesApiForMail };
};

export default useIsDesktop;
