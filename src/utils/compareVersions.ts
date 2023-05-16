/**
 * A simple function to check if two versions are equal.
 *
 * The expected format for a version is:
 * "1.0.0", "0.2.4"
 *
 * If the major and the minor version are the same, the function will return true.
 * The patch level does not matter as patches do not introduce breaking changes.`
 */
const compareVersions = (left: string, right: string): boolean => {
	const delimiter = ".";

	const leftSplit = left.split(delimiter);
	const rightSplit = right.split(delimiter);

	if (leftSplit.length !== 3 || rightSplit.length !== 3) return false;

	return leftSplit[0] === rightSplit[0] && leftSplit[1] === rightSplit[1];
};

export default compareVersions;
