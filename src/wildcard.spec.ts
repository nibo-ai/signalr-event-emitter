import { matchWildcard } from "./wildcard";

describe("wildcard", () => {
	it("should match wildcards with multiple parts and extra separator", () => {
		expect(matchWildcard("/a/b/c", "a/b")).toBeTruthy();
		expect(matchWildcard("a/b/c", "a/b/")).toBeTruthy();
	});

	it("should match wildcards with multiple parts", () => {
		expect(matchWildcard("a/b/c", "a/b")).toBeTruthy();
		expect(matchWildcard("a/b/c", "a/b/d")).toBeFalsy();
	});

	it("should match wildcards with one part", () => {
		expect(matchWildcard("abc", "abc")).toBeTruthy();
		expect(matchWildcard("abc", "ab")).toBeFalsy();
	});

	it("should match wildcards with one part and *", () => {
		expect(matchWildcard("abc", "*")).toBeTruthy();
		expect(matchWildcard("*", "abc")).toBeTruthy();
		expect(matchWildcard("*", "*")).toBeTruthy();
	});
});
