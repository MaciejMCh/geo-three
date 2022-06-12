export const editLines = (code: string, editor: (lines: string[]) => void) => {
	const lines = code.split('\n');
	editor(lines);
	const result = lines.join('\n');
	return result;
};