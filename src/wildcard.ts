export function matchWildcard(...wildcards: string[]): boolean {
	const wildcardParts = wildcards.map(w => w.split("/").filter(part => !!part));
	const n = wildcardParts.reduce((prev, current) => Math.max(prev, current.length), 0);
	for (let j = 0; j < n; j++) {
		for (let i = 1; i < wildcardParts.length; i++) {
			if (wildcardParts[i - 1].length <= j || wildcardParts[i].length <= j) {
				continue;
			}
			if (wildcardParts[i - 1][j] === "*" || wildcardParts[i][j] === "*") {
				continue;
			}
			if (wildcardParts[i - 1][j] !== wildcardParts[i][j]) {
				return false;
			}
		}
	}
	return wildcardParts.findIndex(w => w.length > n) < 0;
}
