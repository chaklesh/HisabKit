import { ErrorCode } from "./ErrorCode";

export class ErrorWithCode extends Error {
  code: ErrorCode;
  data?: Record<string, unknown>;

  constructor(code: ErrorCode, message?: string, data?: Record<string, unknown>) {
    super(message || code);
    this.code = code;
    this.data = data;
    this.name = "ErrorWithCode";
  }

  /**
   * Proxy Factory (Audited from Cal.com)
   * Allows expressive error throwing: throw ErrorWithCode.Factory.UserNotFound("msg")
   */
  static get Factory() {
    return new Proxy(ErrorWithCode, {
      get(_, prop: string) {
        if (prop in ErrorCode) {
          const code = ErrorCode[prop as keyof typeof ErrorCode];
          return (message?: string, data?: Record<string, unknown>) =>
            new ErrorWithCode(code, message, data);
        }
        throw new Error(`Unknown error code provided to factory: ${prop}`);
      },
    }) as unknown as Record<
      keyof typeof ErrorCode,
      (message?: string, data?: Record<string, unknown>) => ErrorWithCode
    >;
  }
}

export function getErrorFromUnknown(cause: unknown): Error & { code?: string } {
  if (cause instanceof ErrorWithCode) return cause;
  if (cause instanceof Error) return cause;
  if (typeof cause === "string") return new Error(cause);
  return new Error("An unknown error occurred");
}
