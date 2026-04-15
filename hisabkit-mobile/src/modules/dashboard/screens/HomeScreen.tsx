import React from 'react';
import { View, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, useTheme, Avatar, IconButton } from 'react-native-paper';
import { 
  LayoutDashboard, 
  WifiOff, 
  CloudSync, 
  PlusCircle, 
  Users, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft,
  Settings as SettingsIcon,
  Bell
} from 'lucide-react-native';
import { Screen } from '../../../shared/components/ui/Screen';
import { Card } from '../../../shared/components/ui/Card';
import { StatPill } from '../../../shared/components/ui/StatPill';
import { Button } from '../../../shared/components/ui/Button';
import { useNetwork } from '../../../context/NetworkContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatCurrency } from '../../../utils/format';
import { useNavigation } from '@react-navigation/native';

export function HomeScreen() {
  const { isOnline, pendingCount } = useNetwork();
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { 
    user, 
    summary, 
    customers, 
    businessStats, 
    isLoading, 
    refetch, 
    isRefreshing 
  } = useDashboardData();

  return (
    <Screen 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={refetch} 
          tintColor={theme.colors.primary} 
        />
      }
    >
      {/* 1. Dashboard Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Text 
            size={44} 
            label={(user?.fullName || user?.username || 'U').slice(0, 1).toUpperCase()} 
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <View>
            <Text variant="labelSmall" style={styles.welcomeText}>GOOD MORNING,</Text>
            <Text variant="titleLarge" style={styles.userName}>
              {user?.fullName?.split(' ')[0] || user?.username}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <IconButton icon={() => <Bell size={22} color="#1e293b" />} onPress={() => {}} />
          <IconButton icon={() => <SettingsIcon size={22} color="#1e293b" />} onPress={() => navigation.navigate('Settings')} />
        </View>
      </View>

      {/* 2. Main Balance Card */}
      <View style={[styles.mainBalance, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.balanceHeader}>
          <Text variant="labelLarge" style={styles.balanceLabel}>NET BALANCE</Text>
          <View style={styles.syncStatus}>
            {isOnline ? <CloudSync size={14} color="white" /> : <WifiOff size={14} color="rgba(255,255,255,0.6)" />}
          </View>
        </View>
        <Text variant="displaySmall" style={styles.balanceAmount}>
          {formatCurrency(businessStats.toCollect - businessStats.toPay)}
        </Text>
        <View style={styles.balanceStats}>
          <View style={styles.balanceStatItem}>
            <ArrowUpRight size={18} color="#ef4444" />
            <View>
              <Text variant="labelSmall" style={styles.statLabel}>TO COLLECT</Text>
              <Text variant="titleMedium" style={styles.statValue}>{formatCurrency(businessStats.toCollect)}</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.balanceStatItem}>
            <ArrowDownLeft size={18} color="#10b981" />
            <View>
              <Text variant="labelSmall" style={styles.statLabel}>TO PAY</Text>
              <Text variant="titleMedium" style={styles.statValue}>{formatCurrency(businessStats.toPay)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. Quick Actions */}
      <View style={styles.quickActions}>
        <ActionBtn 
          icon={<PlusCircle color="white" size={24} />} 
          label="Add Transaction" 
          color={theme.colors.primary} 
          onPress={() => navigation.navigate('LedgerStackRoute', { screen: 'LedgerList', params: { openForm: true } })} 
        />
        <ActionBtn 
          icon={<Users color="#475569" size={24} />} 
          label="Customers" 
          color="#f1f5f9" 
          onPress={() => navigation.navigate('LedgerStackRoute')} 
        />
        <ActionBtn 
          icon={<Search color="#475569" size={24} />} 
          label="Search" 
          color="#f1f5f9" 
          onPress={() => {}} 
        />
      </View>

      {/* 4. Business Summary */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Business Summary</Text>
        <View style={styles.metricRow}>
          <Card style={styles.summaryCard}>
            <Text variant="labelSmall" style={styles.cardLabel}>TOTAL SALES</Text>
            <Text variant="headlineSmall" style={styles.cardValue}>{formatCurrency(summary?.totalSales ?? 0)}</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text variant="labelSmall" style={styles.cardLabel}>COLLECTIONS</Text>
            <Text variant="headlineSmall" style={[styles.cardValue, { color: '#10b981' }]}>{formatCurrency(summary?.totalPayments ?? 0)}</Text>
          </Card>
        </View>
      </View>

      {/* 5. Network Banners */}
      {!isOnline && (
        <View style={[styles.banner, { backgroundColor: '#fffbeb' }]}>
          <WifiOff size={16} color="#f59e0b" />
          <Text variant="labelMedium" style={{ color: '#f59e0b', fontWeight: '700' }}>
            Offline: Showing cached data
          </Text>
        </View>
      )}

      {pendingCount > 0 && (
        <View style={[styles.banner, { backgroundColor: `${theme.colors.primary}15` }]}>
          <CloudSync size={16} color={theme.colors.primary} />
          <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
            {pendingCount} item(s) waiting to sync
          </Text>
        </View>
      )}
    </Screen>
  );
}

const ActionBtn = ({ icon, label, color, onPress }: any) => {
  const isAlt = color === '#f1f5f9';
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text variant="labelSmall" style={[styles.actionLabel, isAlt && { color: '#64748b' }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    backgroundColor: '#f1f5f9',
  },
  avatarLabel: {
    color: '#475569',
    fontWeight: '900',
  },
  welcomeText: {
    color: '#64748b',
    fontWeight: '800',
    letterSpacing: 1,
  },
  userName: {
    fontWeight: '900',
    color: '#1e293b',
  },
  headerActions: {
    flexDirection: 'row',
  },
  mainBalance: {
    marginHorizontal: 16,
    borderRadius: 32,
    padding: 24,
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  syncStatus: {
    opacity: 0.8,
  },
  balanceAmount: {
    color: 'white',
    fontWeight: '900',
    marginBottom: 24,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 16,
  },
  balanceStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '800',
    fontSize: 10,
  },
  statValue: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 8,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  actionLabel: {
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
  },
  cardLabel: {
    color: '#64748b',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    fontWeight: '900',
    color: '#334155',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
});

