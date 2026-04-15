import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ArrowLeft, UserEdit, Trash2, Phone, MapPin } from 'lucide-react-native';
import { formatCurrency } from '../../../utils/format';
import type { Customer } from '../../../shared/types/ledger';

interface KhataHeaderProps {
  customer: Customer;
  currentBalance: number;
  stats: {
    sales: number;
    received: number;
    pending: number;
  };
  onBack: () => void;
  onEditCustomer: () => void;
  onDeleteCustomer: () => void;
  isDeleting: boolean;
}

export const KhataHeader = ({
  customer,
  currentBalance,
  stats,
  onBack,
  onEditCustomer,
  onDeleteCustomer,
  isDeleting,
}: KhataHeaderProps) => {
  const theme = useTheme();
  const isAdvance = currentBalance < 0;

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.titleGroup}>
          <Text variant="headlineSmall" style={styles.customerName}>{customer.name}</Text>
          <View style={styles.metaRow}>
            <Phone size={12} color={theme.colors.outline} />
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{customer.phone || 'No phone'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: `${theme.colors.primary}10` }]} 
          onPress={onEditCustomer}
        >
          <UserEdit size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.balanceSection, { borderColor: theme.colors.outlineVariant }]}>
        <View style={styles.balanceInfo}>
          <Text variant="labelMedium" style={{ color: theme.colors.outline, textTransform: 'uppercase', letterSpacing: 1 }}>
            Current Balance
          </Text>
          <Text variant="displaySmall" style={{ fontWeight: '900', color: isAdvance ? '#10b981' : '#ef4444' }}>
            {formatCurrency(Math.abs(currentBalance))}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {currentBalance === 0 ? 'Account settled' : isAdvance ? 'Customer has advance' : 'Customer has dues'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.deleteBtn, { backgroundColor: '#fef2f2' }]} 
          onPress={onDeleteCustomer}
          disabled={isDeleting}
        >
          <Trash2 size={18} color="#ef4444" />
          <Text variant="labelSmall" style={{ color: '#ef4444', fontWeight: '800' }}>
            {isDeleting ? '...' : 'Delete'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatItem label="Sales" value={formatCurrency(stats.sales)} color={theme.colors.primary} />
        <StatItem label="Received" value={formatCurrency(stats.received)} color="#10b981" />
        <StatItem label="Pending" value={formatCurrency(stats.pending)} color="#f59e0b" />
      </View>
    </View>
  );
};

const StatItem = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={styles.statItem}>
    <Text variant="labelSmall" style={{ color: '#64748b', textTransform: 'uppercase', fontSize: 10, fontWeight: '800' }}>
      {label}
    </Text>
    <Text variant="titleSmall" style={{ fontWeight: '800', color }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  titleGroup: {
    flex: 1,
  },
  customerName: {
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceSection: {
    margin: 16,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    // Shadow for premium look
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  balanceInfo: {
    flex: 1,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    gap: 4,
  },
});
