import { EventEmitter } from "events";
import { matchWildcard } from "./wildcard";

export type EventType = string | symbol;
export type Listener = (...args: any[]) => void;

export abstract class AbstractEventEmitter implements EventEmitter {

	private static ANY_EVENT = "*";
	private allListeners: {[event: string]: Listener[]} = {};

	constructor(private allowedEventNames: EventType[] = [AbstractEventEmitter.ANY_EVENT]) {
	}

	private matchEvents(event1: EventType, event2: EventType): boolean {
		return event1 === AbstractEventEmitter.ANY_EVENT || event2 === AbstractEventEmitter.ANY_EVENT || event1 === event2
				|| matchWildcard(event1.toString(), event2.toString());
	}

	private isEventAllowed(event: EventType): boolean {
		if (!event) {
			return false;
		}
		return this.allowedEventNames.findIndex(ev => this.matchEvents(ev, event)) >= 0;
	}

	private checkIfEventIsAllowed(event: EventType): boolean {
		if (!this.isEventAllowed(event)) {
			throw new Error("Event " + event.toString() + " is not a valid event");
		}
		return true;
	}

	private prepareOnceListener(event: EventType, listener: Listener): Listener {
		const onceListener = (...args: any[]) => {
			listener.call(this, args);
			this.off(event, onceListener);
		};
		return onceListener;
	}

	addListener(event: EventType, listener: Listener): this {
		return this.on(event, listener);
	}

	once(event: EventType, listener: Listener): this {
		return this.on(event, this.prepareOnceListener(event, listener));
	}

	prependOnceListener(event: EventType, listener: Listener): this {
		return this.prependListener(event, this.prepareOnceListener(event, listener));
	}

	removeListener(event: EventType, listener: Listener): this {
		return this.off(event, listener);
	}

	removeAllListeners(event?: EventType): this {
		return this.off(event);
	}

	private getListeners(event: EventType, doNotCreate?: boolean): Listener[] {
		let l = this.allListeners[event.toString()];
		if (!l) {
			l = this.allListeners[event.toString()] = [];
		}
		return l;
	}

	private getMatchingListeners(event: EventType): Listener[] {
		let ll: Listener[] = [];
		for (const ev in this.allListeners) {
			if (this.allListeners.hasOwnProperty(ev) && this.matchEvents(ev, event)) {
				ll = ll.concat(this.allListeners[ev]);
			}
		}
		return ll;
	}

	prependListener(event: EventType, listener: Listener): this {
		this.listeners(event).splice(0, 0, listener);
		return this;
	}

	private maxListeners = 0;

	setMaxListeners(n: number): this {
		this.maxListeners = n;
		return this;
	}

	getMaxListeners(): number {
		return this.maxListeners;
	}

	private checkListenerCountIncrease() {
		if (this.maxListeners > 0 && this.allListenerCount() >= this.getMaxListeners()) {
			throw new Error("Cannot add more than " + this.getMaxListeners() + " listeners");
		}
	}

	listeners(event: EventType): Listener[] {
		return this.getListeners(event, true);
	}

	emit(event: EventType, ...args: any[]): boolean {
		const listenersForEvent = this.getMatchingListeners(event);
		if (!listenersForEvent || !listenersForEvent.length) {
			return false;
		}
		listenersForEvent.forEach((l) => l.call(this, args));
		return true;
	}

	eventNames(): (EventType)[] {
		return Object.keys(this.allListeners);
	}

	private allListenerCount(): number {
		let n = 0;
		for (const e in this.allListeners) {
			if (this.allListeners.hasOwnProperty(e)) {
				n += this.allListeners[e].length;
			}
		}
		return n;
	}

	listenerCount(event: EventType): number {
		const l = this.listeners(event);
		return l ? l.length : 0;
	}

	on(event: EventType, listener: Listener): this {
		this.checkIfEventIsAllowed(event);
		this.checkListenerCountIncrease();
		this.listeners(event).push(listener);
		return this;
	}

	off(event: EventType, listener?: Listener): this {
		const listenersForEvent = this.listeners(event);
		if (!listenersForEvent || !listenersForEvent.length) {
			return this;
		}
		if (!listener) {
			listenersForEvent.splice(0, listenersForEvent.length);
			return this;
		}
		let idx = listenersForEvent.indexOf(listener);
		while (idx >= 0) {
			listenersForEvent.splice(idx, 1);
			idx = listenersForEvent.indexOf(listener);
		}
		return this;
	}
}
