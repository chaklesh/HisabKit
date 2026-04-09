import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { useNetwork } from '../context/NetworkContext';
import { fetchCustomers, createCustomer } from '../services/ledger';
import type { Customer } from '../types/ledger';

export function LedgerScreen() {
  const { isOnline } = useNetwork();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const load = useCallback(async () => {
    const data = await fetchCustomers();
    setCustomers(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleAddCustomer = async () => {
    if (!newName.trim()) { Alert.alert('Error', 'Customer name is required'); return; }
    try {
      await createCustomer({ name: newName.trim(), phone: newPhone.trim() || undefined });
      setNewName(''); setNewPhone(''); setShowAddForm(false);
      await load();
      Alert.alert('Success', 'Customer added');
    } catch (err: any) {
      if (err?.message === 'OFFLINE_QUEUED') {
        Alert.alert('Queued', 'Customer will be created when you are back online.');
        setNewName(''); setNewPhone(''); setShowAddForm(false);
      } else {
        Alert.alert('Error', 'Failed to add customer');
      }
    }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}>
      <View>
        <Text style={styles.kicker}>Ledger</Text>
        <Text style={styles.title}>Customers</Text>
      </View>

      {!isOnline && (
        <View style={styles.offlineBanner}>
          <MaterialCommunityIcons name="wifi-off" size={14} color={colors.text} />
          <Text style={styles.offlineText}>Offline — showing cached data</Text>
        </View>
      )}

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search customers..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* Quick actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionPill} onPress={() => setShowAddForm(!showAddForm)}>
          <MaterialCommunityIcons name={showAddForm ? 'close' : 'plus'} size={16} color={colors.text} />
          <Text style={styles.actionText}>{showAddForm ? 'Cancel' : 'Add customer'}</Text>
        </TouchableOpacity>
      </View>

      {/* Add customer form */}
      {showAddForm && (
        <Card title="New customer">
          <TextInput style={styles.input} placeholder="Name *" placeholderTextColor={colors.textMuted} value={newName} onChangeText={setNewName} />
          <TextInput style={styles.input} placeholder="Phone" placeholderTextColor={colors.textMuted} value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" />
          <TouchableOpacity style={styles.saveBtn} onPress={handleAddCustomer}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Customer list */}
      <Card title={`${filtered.length} customers`}>
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>{search ? 'No matches found' : 'No customers yet'}</Text>
        ) : (
          <FlatList
            data={filtered}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.customerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerName}>{item.name}</Text>
                  {item.phone ? <Text style={styles.customerMeta}>{item.phone}</Text> : null}
                  {item.address ? <Text style={styles.customerMeta}>{item.address}</Text> : null}
                </View>
                <Text style={[styles.balance, (item.totalBalance ?? 0) < 0 ? styles.balancePay : styles.balanceCollect]}>
                  ₹{Math.abs(item.totalBalance ?? 0).toLocaleString('en-IN')}
                </Text>
              </View>
            )}
          />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.brand, textTransform: 'uppercase', letterSpacing: 2, fontSize: 11, fontWeight: '800', marginBottom: 6 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.15)', borderRadius: 12, padding: 10,
  },
  offlineText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  searchInput: {
    backgroundColor: colors.input, borderColor: colors.border, borderWidth: 1,
    borderRadius: 14, color: colors.text, fontSize: 15, paddingHorizontal: 14, paddingVertical: 10,
  },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1,
  },
  actionText: { color: colors.text, fontWeight: '700' },
  input: {
    backgroundColor: colors.input, borderColor: colors.border, borderWidth: 1,
    borderRadius: 12, color: colors.text, fontSize: 14, paddingHorizontal: 12, paddingVertical: 10,
  },
  saveBtn: { backgroundColor: colors.brand, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: colors.background, fontWeight: '800', fontSize: 15 },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  customerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12,
  },
  customerName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  customerMeta: { color: colors.textMuted, marginTop: 2, fontSize: 12 },
  balance: { fontSize: 16, fontWeight: '900' },
  balanceCollect: { color: colors.success },
  balancePay: { color: colors.danger },
});
