import * as signalr from "jquery";
window["jQuery"] = signalr;
import "signalr";
import { EventType, AbstractEventEmitter, Listener } from "./abstract-event-emitter";

/** Settings for {@link SignalrEventEmitter} */
export interface SignalrEventEmitterSettings extends SignalR.Hub.Options, SignalR.ConnectionOptions {
	/** All the event names for which is allowed to register events. If it contais "*" all events are allowed. */
	allowedEventNames: EventType[];

	/** Endpoint url for SignalR connection. */
	url: string;
	/** SignalR hub name. */
	hubName: string;

	/** Query parameters to be passed to SignalR */
	queryParams?: string | Object;

	/** Client protocol version. */
	clientProtocol?: string;

	reconnectWindow?: number;

	/** Transport connection timeout in milliseconds. */
	transportConnectTimeout: number;
}

/** A SignalR connection implemented as an EventEmitter. */
export class SignalrEventEmitter extends AbstractEventEmitter {

	/** The underlying connection. */
	private connection: SignalR.Hub.Connection;
	/** The underlying proxy for the hub. */
	private proxy: SignalR.Hub.Proxy;

	/** Creates a SignalR connection and proxy and connects to it.
	 * @param settings the SignalR connection settings.
	 */
	constructor(public readonly settings?: SignalrEventEmitterSettings) {
		super(settings.allowedEventNames.concat("signalr.error", "signalr.stateChanged"));
		this.settings = Object.assign({}, {
					logging: false,
					clientProtocol: "1.5",
					transport: "auto"
				}, this.settings);
		this.connect();
	}

	/** Returns true if a SignalR connection is established. */
	public isConnected() {
		return this.connection && this.connection.state === SignalR.ConnectionState.Connected;
	}

	/** Establishes the SignalR connection. */
	private connect(): void {
		if (this.connection) {
			return;
		}
		// create the connection
		if (this.settings && this.settings.url) {
			this.connection = signalr.hubConnection(this.settings.url, {
					logging: this.settings.logging,
					useDefaultPath: false });
		} else {
			this.connection = signalr.hubConnection();
		}
		// create the proxy
		this.proxy = this.connection.createHubProxy(this.settings.hubName);
		// register handler for events
		this.settings.allowedEventNames.forEach((event) => {
			this.proxy.on(event.toString(), this.registerHandler(event));
		});
		// set connection parameters
		this.connection.qs = this.settings.queryParams;
		this.connection.clientProtocol = this.settings.clientProtocol;
		this.connection.reconnectWindow = this.settings.reconnectWindow;
		this.connection.transportConnectTimeout = this.settings.transportConnectTimeout;
		// register handlers for connection events
		this.connection.error(this.registerHandler("signalr.error"));
		this.connection.stateChanged(this.registerHandler("signalr.stateChanged"));
		// start the connection
		this.connection.start({
				transport: this.settings.transport,
				waitForPageLoad: this.settings.waitForPageLoad,
				jsonp: this.settings.jsonp,
				pingInterval: this.settings.pingInterval,
				withCredentials: this.settings.withCredentials
				});
	}

	/** Invoke a SignalR method.
	 * @param methodName the name of the method to be invoked
	 * @param args the arguments for the invocation
	 */
	public invoke(methodName: string, ...args: any[]): Promise<any> {
		return Promise.resolve(this.proxy.invoke(methodName, args));
	}

	/** Closes the connection. */
	public close(): void {
		if (this.connection) {
			this.connection.stop();
			delete this.connection;
			delete this.proxy;
		}
	}

	private handlers: {[event: string]: Listener} = {};

	private registerHandler(event: EventType): Listener {
		event = event.toString();
		if (!this.handlers[event]) {
			this.handlers[event] = (... args: any[]) => {
				this.emit(event, args);
			};
		}
		return this.handlers[event];
	}

	on(event: EventType, listener: Listener): this {
		this.registerHandler(event);
		super.on(event, listener);
		return this;
	}
}
