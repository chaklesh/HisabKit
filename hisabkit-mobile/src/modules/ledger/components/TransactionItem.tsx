import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Paperclip, Pencil, Trash2, Calendar } from 'lucide-react-native';
import { Card } from '../../../shared/components/ui/Card';
import { formatCurrency } from '../../../utils/format';
import type { LedgerTransaction, TransactionAttachment } from '../../../shared/types/ledger';

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
  const theme = useTheme();
  const isSale = transaction.type === 'SALE';
  const tone = isSale ? '#ef4444' : '#10b981';

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.leftCol}>
          <View style={styles.dateRow}>
            <Calendar size={12} color={theme.colors.outline} />
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              {new Date(transaction.timestamp).toLocaleDateString(undefined, { 
                day: 'numeric', month: 'short', year: 'numeric' 
              })}
            </Text>
          </View>
          <Text variant="titleMedium" style={styles.description}>
            {transaction.description || (isSale ? 'Sale Entry' : 'Payment Received')}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            Ref: {transaction.referenceNo}
          </Text>
        </View>
        <View style={styles.rightCol}>
          <Text variant="titleLarge" style={{ fontWeight: '900', color: tone }}>
            {formatCurrency(isSale ? transaction.totalAmount : transaction.paidAmount)}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: `${tone}10` }]}>
            <Text variant="labelSmall" style={{ color: tone, fontWeight: '900', textTransform: 'uppercase' }}>
              {isSale ? 'You Gave' : 'You Got'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.metaSection}>
        {isSale && Number(transaction.paidAmount ?? 0) > 0 && (
          <Text variant="labelSmall" style={{ color: '#10b981', fontWeight: '800' }}>
            Paid Now: {formatCurrency(transaction.paidAmount)}
          </Text>
        )}
        {isSale && Number(transaction.dueAmount ?? 0) > 0 && (
          <Text variant="labelSmall" style={{ color: '#f59e0b', fontWeight: '800' }}>
            Due Left: {formatCurrency(transaction.dueAmount)}
          </Text>
        )}
      </View>

      {attachments.length > 0 && (
        <View style={styles.attachmentList}>
          {attachments.map((file) => (
            <TouchableOpacity 
              key={file.id} 
              style={[styles.attachmentChip, { backgroundColor: '#f8fafc' }]}
              onPress={() => onOpenAttachment(file)}
            >
              <Paperclip size={14} color={theme.colors.primary} />
              <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>{file.fileName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionIconButton} onPress={() => onEdit(transaction)}>
          <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
            <Pencil size={18} color="#64748b" />
          </View>
          <Text variant="labelSmall" style={styles.actionLabel}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconButton} onPress={() => onDelete(transaction)}>
          <View style={[styles.iconBox, { backgroundColor: '#fff1f2' }]}>
            <Trash2 size={18} color="#ef4444" />
          </View>
          <Text variant="labelSmall" style={styles.actionLabelRed}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 4,
    padding: 18,
    borderRadius: 24,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  leftCol: {
    flex: 1,
    gap: 6,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 11,
  },
  description: {
    fontWeight: '900',
    color: '#1e293b',
    fontSize: 16,
  },
  refText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  amountText: {
    fontWeight: '950',
    fontSize: 20,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  typeText: {
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  metaSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  metaPill: {
    color: '#64748b',
    fontWeight: '800',
    fontSize: 11,
  },
  attachmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  actionIconButton: {
    alignItems: 'center',
    gap: 4,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#64748b',
    fontWeight: '800',
    fontSize: 10,
  },
  actionLabelRed: {
    color: '#ef4444',
    fontWeight: '800',
    fontSize: 10,
  },
});
