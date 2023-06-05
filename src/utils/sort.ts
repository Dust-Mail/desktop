import { Preview } from "@models/preview";
import { SortType } from "@models/sort";

export const sortPreviews = (
	previews: Preview[],
	sortType: SortType
): Preview[] => {
	switch (sortType) {
		case "date-descending":
			previews.sort((a, b) => (b.sent ?? 0) - (a.sent ?? 0));
			break;

		case "date-ascending":
			previews.sort((a, b) => (a.sent ?? 0) - (b.sent ?? 0));
			break;

		case "alphabetical-descending":
			previews.sort((a, b) => a.subject?.localeCompare(b.subject ?? "") ?? 0);
			break;

		case "alphabetical-ascending":
			previews.sort((a, b) => b.subject?.localeCompare(a.subject ?? "") ?? 0);
			break;

		default:
			break;
	}

	return previews;
};
