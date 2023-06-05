import z from "zod";

export const sortTypeList = [
	"date-ascending",
	"date-descending",
	"alphabetical-descending",
	"alphabetical-ascending"
] as const;

export const sortTypeNiceNames: Record<SortType, string> = {
	"alphabetical-ascending": "Alphabetical (ascending)",
	"alphabetical-descending": "Alphabetical (descending)",
	"date-ascending": "Date (ascending)",
	"date-descending": "Date (descending)"
};

export const SortTypeModel = z.enum(sortTypeList);

export type SortType = z.infer<typeof SortTypeModel>;
