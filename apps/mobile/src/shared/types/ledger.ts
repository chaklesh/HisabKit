/**
 * apps/mobile/src/shared/types/ledger.ts
 * Proxies domain types to @hisabkit/types to ensure cross-platform parity.
 */
export * from "@hisabkit/types";

// Type Alias for compatibility with existing code during migration
import type { Attachment } from "@hisabkit/types";
export type TransactionAttachment = Attachment;
