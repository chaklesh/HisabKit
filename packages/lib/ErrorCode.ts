export enum ErrorCode {
  // Generic HTTP Parity
  Unauthorized = "UNAUTHORIZED",
  Forbidden = "FORBIDDEN",
  NotFound = "NOT_FOUND",
  BadRequest = "BAD_REQUEST",
  InternalServerError = "INTERNAL_SERVER_ERROR",

  // Identity & Auth
  UserNotFound = "USER_NOT_FOUND",
  InvalidCredentials = "INVALID_CREDENTIALS",
  TokenExpired = "TOKEN_EXPIRED",

  // Ledger Business Logic
  CustomerNotFound = "CUSTOMER_NOT_FOUND",
  TransactionNotFound = "TRANSACTION_NOT_FOUND",
  InsufficientBalance = "INSUFFICIENT_BALANCE",
  InvalidTransactionType = "INVALID_TRANSACTION_TYPE",
  TenantMismatch = "TENANT_MISMATCH",

  // System
  DatabaseError = "DATABASE_ERROR",
  RateLimitExceeded = "RATE_LIMIT_EXCEEDED",
}
