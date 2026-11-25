// Chrome DevTools Protocol responses and events on a single WebSocket.
type CdpResult = Record<string, unknown>;
type CdpResponse =
  { kind: "result"; id: number; result: CdpResult } | { kind: "error"; id: number; error: string };
type CdpEvent = { kind: "event"; method: string; sessionId?: string };
type Pending = {
  resolve: (value: CdpResult) => void;
  reject: (error: Error) => void;
};

// Decode a reply's success payload or its protocol error.
function parseCdpResponse(id: number, { error, result }: CdpResult): CdpResponse {
  if (error) {
    const detail = typeof error === "object" && "message" in error ? error.message : undefined;
    return {
      kind: "error",
      id,
      error: typeof detail === "string" ? detail : "Invalid Chrome DevTools error",
    };
  }
  if (result && typeof result === "object" && !Array.isArray(result))
    return { kind: "result", id, result: { ...result } };
  return { kind: "error", id, error: "Invalid Chrome DevTools result" };
}

// Distinguish command replies from events sent to a particular page session.
export function parseCdpMessage(raw: string): CdpResponse | CdpEvent | undefined {
  const message = JSON.parse(raw) as CdpResult | null;
  if (!message || typeof message !== "object") return;
  const { id, method, sessionId } = message;
  if (typeof id === "number") return parseCdpResponse(id, message);
  if (typeof method !== "string") return;
  if (sessionId !== undefined && typeof sessionId !== "string") return;
  return { kind: "event", method, sessionId };
}

// Route DevTools messages to the command or page listener waiting for them.
class CdpConnection {
  #pending = new Map<number, Pending>();
  #events = new Set<(event: CdpEvent) => void>();
  #id = 0;
  private readonly socket: WebSocket;

  constructor(socket: WebSocket) {
    this.socket = socket;
    socket.addEventListener("message", (event) =>
      this.receive(parseCdpMessage(String(event.data))),
    );
    // A Chrome that exits mid-run answers no pending call: fail them, so no await hangs.
    socket.addEventListener("close", () => {
      for (const request of this.#pending.values())
        request.reject(new Error("Chrome's DevTools socket closed"));
      this.#pending.clear();
    });
  }

  // Deliver the reply to its command, or broadcast an event to listeners.
  private receive(message: CdpResponse | CdpEvent | undefined) {
    if (!message) return;
    if (message.kind === "event") {
      for (const listener of this.#events) listener(message);
      return;
    }
    const request = this.#pending.get(message.id);
    if (!request) return;
    this.#pending.delete(message.id);
    if (message.kind === "error") request.reject(new Error(message.error));
    else request.resolve(message.result);
  }

  get lastRequestId() {
    return this.#id;
  }

  // Correlate the eventual reply with this request's wire ID.
  send(method: string, params: object = {}, sessionId?: string) {
    return new Promise<CdpResult>((resolve, reject) => {
      const id = ++this.#id;
      this.#pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }

  // Resolve when the named event arrives for this page session.
  once(method: string, sessionId: string) {
    return new Promise<void>((resolve) => {
      const listener = (event: CdpEvent) => {
        if (event.method !== method || event.sessionId !== sessionId) return;
        this.#events.delete(listener);
        resolve();
      };
      this.#events.add(listener);
    });
  }

  close() {
    this.socket.close();
  }
}

// Open the DevTools socket before the first protocol request.
export async function connectCdp(url: string) {
  const socket = new WebSocket(url);
  await new Promise<Event>((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", () => reject(new Error("Chrome's DevTools socket failed")), {
      once: true,
    });
  });
  return new CdpConnection(socket);
}
