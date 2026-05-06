import { Calendar, Paperclip, Pencil, Trash2 } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Card } from "../../../shared/components/ui/Card";
import type { LedgerTransaction, TransactionAttachment } from "../../../shared/types/ledger";
import { formatCurrency } from "../../../utils/format";

interface TransactionItemProps {
  transaction: LedgerTransaction;
  attachments: TransactionAttachment[];
  onEdit: (txn: LedgerTransaction) => void;
  onDelete: (txn: LedgerTransaction) => void;
  onOpenAttachment: (file: TransactionAttachment) => void;
}

export const TransactionItem = ({
  transaction,
  attachments,
  onEdit,
  onDelete,
  onOpenAttachment,
}: TransactionItemProps) => {
  const _theme = useTheme();
  const { t } = useTranslation();
  const isSale = transaction.type === "SALE";
  const tone = isSale ? "#ef4444" : "#10b981";

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.leftCol}>
          <Text variant="titleMedium" style={styles.description}>
            {transaction.description ||
              (isSale
                ? t("ledger.transaction.sale_entry", "Sale Entry")
                : t("ledger.transaction.payment_received", "Payment Received"))}
          </Text>
          <Text variant="labelSmall" style={styles.refText}>
            REF: {transaction.referenceNo.split("-")[1] || transaction.referenceNo}
          </Text>
        </View>
        <View style={styles.rightCol}>
          <Text variant="titleLarge" style={[styles.amountText, { color: tone }]}>
            {formatCurrency(isSale ? transaction.totalAmount : transaction.paidAmount)}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: `${tone}15` }]}>
            <Text variant="labelSmall" style={[styles.typeText, { color: tone }]}>
              {isSale
                ? t("ledger.customer.you_gave", "YOU GAVE")
                : t("ledger.customer.you_got", "YOU GOT")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.metaSection}>
        <View style={styles.metaPills}>
          {isSale && Number(transaction.dueAmount ?? 0) > 0 && (
            <View style={[styles.metaPill, { backgroundColor: "#fff7ed" }]}>
              <Text variant="labelSmall" style={[styles.metaLabel, { color: "#f59e0b" }]}>
                {t("ledger.customer.due_label", "DUE:")} {formatCurrency(transaction.dueAmount)}
              </Text>
            </View>
          )}
          {attachments.length > 0 && (
            <View style={styles.metaPill}>
              <Text variant="labelSmall" style={styles.metaLabel}>
                {attachments.length} {t("ledger.transaction.attachments_label", "ATTACHMENT(S)")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#f1f5f9" }]}
            onPress={() => onEdit(transaction)}
          >
            <Pencil size={14} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#fee2e2" }]}
            onPress={() => onDelete(transaction)}
          >
            <Trash2 size={14} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {attachments.length > 0 && (
        <View style={styles.attachmentList}>
          {attachments.map((file) => (
            <TouchableOpacity
              key={file.id}
              style={styles.attachmentChip}
              onPress={() => onOpenAttachment(file)}
            >
              <Paperclip size={12} color="#64748b" />
              <Text
                variant="bodySmall"
                style={{ color: "#64748b", fontSize: 10, fontWeight: "700" }}
                numberOfLines={1}
              >
                {file.fileName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    ...Platform.select({
      web: { boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" },
      default: { elevation: 2 },
    }),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  leftCol: {
    flex: 1,
    gap: 4,
  },
  rightCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  description: {
    fontWeight: "800",
    color: "#1e293b",
    fontSize: 15,
  },
  refText: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  amountText: {
    fontWeight: "900",
    fontSize: 18,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    fontWeight: "900",
    fontSize: 8,
    letterSpacing: 0.5,
  },
  metaSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
  },
  metaPills: {
    flexDirection: "row",
    gap: 8,
  },
  metaPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaLabel: {
    color: "#64748b",
    fontWeight: "800",
    fontSize: 9,
  },
  attachmentList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
