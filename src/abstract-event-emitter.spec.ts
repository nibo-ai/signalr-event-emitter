import { AbstractEventEmitter } from "./abstract-event-emitter";

class TestEventEmitter extends AbstractEventEmitter {
}

describe("AbstractEventEmitter", () => {
	let eventEmitter: TestEventEmitter;

	beforeEach(() => {
		eventEmitter = new TestEventEmitter();
	});

	it("should register listeners", () => {
		let emitted;
		eventEmitter.on("abc", (args) => {
			emitted = args[0];
		});
		expect(eventEmitter.listeners("abc").length).toBe(1);
		expect(eventEmitter.emit("abc", 100)).toBeTruthy();
		expect(emitted).toBe(100);
	});

	it("should unregister listeners", () => {
		let emitted;
		eventEmitter.on("abc", (args) => {
			emitted = args[0];
		});
		expect(eventEmitter.emit("abc", 100)).toBeTruthy();
		eventEmitter.off("abc");
		expect(eventEmitter.emit("abc", 200)).toBeFalsy();
		expect(emitted).toBe(100);
	});

	it("should register wildcard listeners", () => {
		let emitted;
		eventEmitter.on("a/b/*", (args) => {
			emitted = args[0];
		});
		expect(eventEmitter.emit("a/b/c", 100)).toBeTruthy();
		expect(emitted).toBe(100);
	});
});
