import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/ledger';
import type { Customer } from '../types/ledger';
import type { LedgerStackParamList } from '../navigation/AppNavigator';
import { formatCurrency } from '../utils/format';

type Props = NativeStackScreenProps<LedgerStackParamList, 'LedgerList'>;
type FilterMode = 'ALL' | 'COLLECT' | 'PAY' | 'SETTLED';

export function LedgerScreen({ navigation }: Props) {
  const { isOnline } = useNetwork();
  const { colors } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newGstNumber, setNewGstNumber] = useState('');
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetchCustomers();
    setCustomers(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const resetCustomerForm = () => {
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewGstNumber('');
    setEditingCustomerId(null);
  };

  const closeCustomerForm = () => {
    setShowAddForm(false);
    resetCustomerForm();
  };

  const handleSaveCustomer = async () => {
    if (savingCustomer) return;

    if (!newName.trim()) {
      Alert.alert('Error', 'Customer name is required');
      return;
    }

    setSavingCustomer(true);
    try {
      const payload = {
        name: newName.trim(),
        phone: newPhone.trim() || undefined,
        email: newEmail.trim() || undefined,
        address: newAddress.trim() || undefined,
        gstNumber: newGstNumber.trim() || undefined,
      };

      if (editingCustomerId) {
        await updateCustomer(editingCustomerId, payload);
      } else {
        await createCustomer(payload);
      }

      closeCustomerForm();
      await load();
      Alert.alert('Success', editingCustomerId ? 'Customer updated' : 'Customer added');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'OFFLINE_QUEUED') {
        Alert.alert('Queued', 'Customer will be created when you are back online.');
        closeCustomerForm();
      } else {
        Alert.alert('Error', editingCustomerId ? 'Failed to update customer. Please try again.' : 'Failed to add customer. Please try again.');
      }
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setNewName(customer.name);
    setNewPhone(customer.phone ?? '');
    setNewEmail(customer.email ?? '');
    setNewAddress(customer.address ?? '');
    setNewGstNumber(customer.gstNumber ?? '');
    setShowAddForm(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    Alert.alert(
      'Delete customer',
      `Delete ${customer.name} and all of this customer's transactions? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (deletingCustomerId) return;
            setDeletingCustomerId(customer.id);
            try {
              await deleteCustomer(customer.id);
              if (editingCustomerId === customer.id) {
                closeCustomerForm();
              }
              await load();
              Alert.alert('Deleted', 'Customer removed successfully.');
            } catch {
              Alert.alert('Error', 'Unable to delete customer right now.');
            } finally {
              setDeletingCustomerId(null);
            }
          },
        },
      ]
    );
  };

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers
      .filter((customer) => {
        const balance = Number(customer.totalBalance ?? 0);
        if (filterMode === 'COLLECT') return balance > 0;
        if (filterMode === 'PAY') return balance < 0;
        if (filterMode === 'SETTLED') return balance === 0;
        return true;
      })
      .filter((customer) => {
        if (!term) return true;
        return [customer.name, customer.phone, customer.email, customer.address]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term));
      })
      .sort((left, right) => Math.abs(Number(right.totalBalance ?? 0)) - Math.abs(Number(left.totalBalance ?? 0)));
  }, [customers, filterMode, search]);

  const totals = useMemo(() => {
    return customers.reduce(
      (acc, customer) => {
        const balance = Number(customer.totalBalance ?? 0);
        if (balance > 0) acc.collect += balance;
        if (balance < 0) acc.pay += Math.abs(balance);
        return acc;
      },
      { collect: 0, pay: 0 }
    );
  }, [customers]);

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}>
      <SectionHeader title="Customer ledger" subtitle="Search dues, track advances, and add parties quickly." />

      {!isOnline && (
        <View style={[styles.banner, { backgroundColor: colors.warningSoft }]}>
          <MaterialCommunityIcons name="wifi-off" size={14} color={colors.warning} />
          <Text style={[styles.bannerText, { color: colors.warning }]}>Offline mode: showing cached customer data.</Text>
        </View>
      )}

      <View style={styles.summaryRow}>
        <Card title="To collect" subtitle="Due from customers">
          <Text style={[styles.summaryValue, { color: colors.danger }]}>{formatCurrency(totals.collect)}</Text>
        </Card>
        <Card title="To pay" subtitle="Advance balance">
          <Text style={[styles.summaryValue, { color: colors.success }]}>{formatCurrency(totals.pay)}</Text>
        </Card>
      </View>

      <Card title="Find customer" subtitle="Filter by name, mobile, dues, or settled accounts.">
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
          placeholder="Search customers"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {(['ALL', 'COLLECT', 'PAY', 'SETTLED'] as FilterMode[]).map((mode) => {
            const active = mode === filterMode;
            const label = mode === 'ALL' ? 'All' : mode === 'COLLECT' ? 'Due' : mode === 'PAY' ? 'Advance' : 'Settled';
            return (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.brandSoft : colors.surfaceSoft,
                    borderColor: active ? colors.brand : colors.border,
                  },
                ]}
                onPress={() => setFilterMode(mode)}
              >
                <Text style={[styles.filterLabel, { color: active ? colors.brand : colors.textMuted }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.brand }]}
          onPress={() => {
            if (showAddForm) {
              closeCustomerForm();
              return;
            }
            resetCustomerForm();
            setShowAddForm(true);
          }}
        >
          <MaterialCommunityIcons name={showAddForm ? 'close' : 'plus'} size={18} color={colors.onBrand} />
          <Text style={[styles.addButtonText, { color: colors.onBrand }]}>{showAddForm ? 'Close form' : 'Add customer'}</Text>
        </TouchableOpacity>
      </Card>

      {showAddForm && (
        <Card
          title={editingCustomerId ? 'Edit customer' : 'New customer'}
          subtitle={editingCustomerId ? 'Correct party details without creating duplicates.' : 'Create a fresh khata party in your ledger.'}
        >
          <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Name *" placeholderTextColor={colors.textMuted} value={newName} onChangeText={setNewName} editable={!savingCustomer} />
          <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Phone" placeholderTextColor={colors.textMuted} value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" editable={!savingCustomer} />
          <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Email" placeholderTextColor={colors.textMuted} value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" autoCapitalize="none" editable={!savingCustomer} />
          <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Address" placeholderTextColor={colors.textMuted} value={newAddress} onChangeText={setNewAddress} editable={!savingCustomer} />
          <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="GST Number" placeholderTextColor={colors.textMuted} value={newGstNumber} onChangeText={setNewGstNumber} autoCapitalize="characters" editable={!savingCustomer} />
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.brand }, savingCustomer && styles.disabledBtn]}
            onPress={handleSaveCustomer}
            disabled={savingCustomer}
          >
            <Text style={[styles.saveBtnText, { color: colors.onBrand }]}>{savingCustomer ? 'Saving...' : editingCustomerId ? 'Update customer' : 'Save customer'}</Text>
          </TouchableOpacity>
        </Card>
      )}

      <Card title={`${filteredCustomers.length} customer(s)`} subtitle="Tap a customer to open their khata.">
        {filteredCustomers.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>{search ? 'No matches found' : 'No customers yet'}</Text>
        ) : (
          <FlatList
            data={filteredCustomers}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const balance = Number(item.totalBalance ?? 0);
              const status = balance > 0 ? 'You will get' : balance < 0 ? 'You will pay' : 'Settled';
              const tone = balance > 0 ? colors.danger : balance < 0 ? colors.success : colors.textMuted;

              return (
                <TouchableOpacity style={[styles.customerRow, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('CustomerKhata', { customer: item })}>
                  <View style={styles.customerMain}>
                    <View style={[styles.avatar, { backgroundColor: colors.brandSoft }]}>
                      <Text style={[styles.avatarText, { color: colors.brand }]}>{item.name.slice(0, 1).toUpperCase()}</Text>
                    </View>
                    <View style={styles.customerInfo}>
                      <Text style={[styles.customerName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.customerMeta, { color: colors.textMuted }]}>{item.phone || item.address || 'No contact added'}</Text>
                      <Text style={[styles.customerStatus, { color: tone }]}>{status}</Text>
                    </View>
                  </View>
                  <View style={styles.customerRight}>
                    <Text style={[styles.balance, { color: tone }]}>{formatCurrency(Math.abs(balance))}</Text>
                    <View style={styles.rowActions}>
                      <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]} onPress={() => handleEditCustomer(item)}>
                        <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.text} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: colors.dangerSoft, borderColor: colors.border }, deletingCustomerId === item.id && styles.disabledBtn]}
                        onPress={() => handleDeleteCustomer(item)}
                        disabled={deletingCustomerId === item.id}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerText: { fontSize: 13, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryValue: { fontSize: 22, fontWeight: '900' },
  searchInput: {
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterLabel: { fontSize: 12, fontWeight: '800' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 6,
  },
  addButtonText: { fontSize: 15, fontWeight: '800' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  saveBtn: { borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  disabledBtn: { opacity: 0.6 },
  saveBtnText: { fontWeight: '800', fontSize: 15 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  customerMain: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '900' },
  customerInfo: { flex: 1, gap: 2 },
  customerName: { fontSize: 16, fontWeight: '800' },
  customerMeta: { fontSize: 12 },
  customerStatus: { fontSize: 12, fontWeight: '700' },
  customerRight: { alignItems: 'flex-end', gap: 8 },
  balance: { fontSize: 15, fontWeight: '900' },
  rowActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
