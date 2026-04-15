import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert, Linking } from 'react-native';
import { Text, useTheme, IconButton, Avatar, Menu, Divider, Portal, Dialog } from 'react-native-paper';
import { 
  PlusCircle, 
  MinusCircle, 
  BookOpen, 
  ChevronLeft, 
  Share2, 
  MoreVertical,
  Phone,
  MessageSquare
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../../shared/components/ui/Screen';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { KhataHeader } from '../components/KhataHeader';
import { TransactionItem } from '../components/TransactionItem';
import { TransactionForm } from '../components/TransactionForm';
import { useTransactionData } from '../hooks/useTransactionData';
import { useTransactionMutations } from '../hooks/useTransactionMutations';
import { useCustomerMutations } from '../hooks/useCustomerMutations';
import type { LedgerStackParamList } from '../../../app/navigation/RootNavigator';
import { ENV } from '../../../shared/config/env';
import { formatCurrency } from '../../../utils/format';
import type { Customer, LedgerTransaction, TransactionAttachment } from '../../../shared/types/ledger';

type Props = NativeStackScreenProps<LedgerStackParamList, 'CustomerKhata'>;

export function CustomerKhataScreen({ route, navigation }: Props) {
  const { customer: initialCustomer } = route.params;
  const theme = useTheme();
  
  // Data & Mutations
  const { 
    transactions, 
    attachments, 
    stats, 
    currentBalance, 
    isLoading, 
    refetch, 
    isRefreshing 
  } = useTransactionData(initialCustomer.id);

  const { createTransaction, updateTransaction, deleteTransaction, isSubmitting: isTxnSaving } = useTransactionMutations(initialCustomer.id);
  const { updateCustomer, deleteCustomer, isSaving: isCustomerSaving, isDeleting: isCustomerDeleting } = useCustomerMutations();

  // Local State
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [txnType, setTxnType] = useState<'SALE' | 'PAYMENT'>('SALE');
  const [editingTxn, setEditingTxn] = useState<LedgerTransaction | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: initialCustomer.name,
    phone: initialCustomer.phone || '',
    address: initialCustomer.address || '',
  });

  const handleAddTxn = (type: 'SALE' | 'PAYMENT') => {
    setTxnType(type);
    setEditingTxn(null);
    setShowTxnForm(true);
  };

  const handleEditTxn = (txn: LedgerTransaction) => {
    setEditingTxn(txn);
    setShowTxnForm(true);
  };

  const handleSaveTxn = async (data: any) => {
    try {
      if (editingTxn) {
        await updateTransaction({ id: editingTxn.id, data: { ...data, customerId: initialCustomer.id } });
      } else {
        await createTransaction({ ...data, customerId: initialCustomer.id });
      }
      setShowTxnForm(false);
    } catch (e) {}
  };

  const handleDeleteTxn = (txn: LedgerTransaction) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(txn.id) },
    ]);
  };

  return (
    <Screen style={styles.container}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerTop}>
          <IconButton icon={() => <ChevronLeft color="white" size={24} />} onPress={() => navigation.goBack()} />
          <Text variant="titleLarge" style={styles.headerTitle}>Account Details</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={<IconButton icon={() => <MoreVertical color="white" size={24} />} onPress={() => setMenuVisible(true)} />}
          >
            <Menu.Item onPress={() => { setMenuVisible(false); setShowCustomerForm(true); }} title="Edit Profile" leadingIcon="pencil" />
            <Divider />
            <Menu.Item onPress={() => { setMenuVisible(false); }} title="Share PDF" leadingIcon="share-variant" />
            <Menu.Item onPress={() => { setMenuVisible(false); }} title="Delete Customer" leadingIcon="trash-can" titleStyle={{ color: '#ef4444' }} />
          </Menu>
        </View>

        <View style={styles.headerProfile}>
          <Avatar.Text 
            size={60} 
            label={initialCustomer.name.slice(0, 1).toUpperCase()} 
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text variant="headlineSmall" style={styles.profileName}>{initialCustomer.name}</Text>
            <View style={styles.profileMeta}>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${initialCustomer.phone}`)} style={styles.metaAction}>
                <Phone size={14} color="rgba(255,255,255,0.7)" />
                <Text variant="labelSmall" style={styles.metaText}>{initialCustomer.phone || 'N/A'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.metaAction}>
                <MessageSquare size={14} color="rgba(255,255,255,0.7)" />
                <Text variant="labelSmall" style={styles.metaText}>SMS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <View>
            <Text variant="labelSmall" style={styles.balanceLabel}>NET BALANCE</Text>
            <Text variant="displaySmall" style={styles.balanceVal}>
              {formatCurrency(Math.abs(currentBalance))}
            </Text>
          </View>
          <View style={[styles.balanceIndicator, { backgroundColor: currentBalance >= 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' }]}>
            <Text variant="labelMedium" style={{ color: currentBalance >= 0 ? '#fecaca' : '#bbf7d0', fontWeight: '900' }}>
              {currentBalance >= 0 ? 'GIVE' : 'GET'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={transactions}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              attachments={attachments[item.id] || []}
              onEdit={handleEditTxn}
              onDelete={handleDeleteTxn}
              onOpenAttachment={(file) => Linking.openURL(`${ENV.API_BASE_URL}/ledger/attachments/${file.id}/content`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <BookOpen size={48} color="#e2e8f0" />
              <Text variant="bodyLarge" style={{ color: '#94a3b8', marginTop: 12, fontWeight: '700' }}>
                No recording history
              </Text>
            </View>
          }
        />
      </View>

      <View style={styles.stickyFooter}>
        <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#ef4444' }]} onPress={() => handleAddTxn('SALE')} activeOpacity={0.8}>
          <View style={styles.footerIconBox}><PlusCircle color="#ef4444" size={20} /></View>
          <Text variant="titleMedium" style={styles.footerBtnText}>You Gave</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#10b981' }]} onPress={() => handleAddTxn('PAYMENT')} activeOpacity={0.8}>
          <View style={styles.footerIconBox}><MinusCircle color="#10b981" size={20} /></View>
          <Text variant="titleMedium" style={styles.footerBtnText}>You Got</Text>
        </TouchableOpacity>
      </View>

      <TransactionForm
        visible={showTxnForm}
        onClose={() => setShowTxnForm(false)}
        onSave={handleSaveTxn}
        initialType={txnType}
        editingTransaction={editingTxn}
        isLoading={isTxnSaving}
      />

      <Portal>
        <Dialog visible={showCustomerForm} onDismiss={() => setShowCustomerForm(false)} style={{ borderRadius: 28 }}>
          <Dialog.Title style={{ fontWeight: '900' }}>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <Input label="Name" value={customerForm.name} onChangeText={(t) => setCustomerForm({ ...customerForm, name: t })} />
            <Input label="Phone" value={customerForm.phone} onChangeText={(t) => setCustomerForm({ ...customerForm, phone: t })} keyboardType="phone-pad" />
            <Input label="Address" value={customerForm.address} onChangeText={(t) => setCustomerForm({ ...customerForm, address: t })} />
          </Dialog.Content>
          <Dialog.Actions style={{ padding: 20 }}>
            <Button mode="text" onPress={() => setShowCustomerForm(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button onPress={async () => { await updateCustomer({ id: initialCustomer.id, data: customerForm }); setShowCustomerForm(false); }} loading={isCustomerSaving} style={{ flex: 1 }}>Update</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerTitle: {
    color: 'white',
    fontWeight: '900',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  avatar: {
    backgroundColor: 'white',
  },
  avatarLabel: {
    color: '#6366f1',
    fontWeight: '900',
  },
  profileName: {
    color: 'white',
    fontWeight: '900',
  },
  profileMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  metaAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
  },
  balanceSection: {
    marginTop: 24,
    marginHorizontal: 24,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '900',
    letterSpacing: 1,
  },
  balanceVal: {
    color: 'white',
    fontWeight: '900',
  },
  balanceIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  stickyFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  footerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    color: 'white',
    fontWeight: '900',
  },
  empty: {
    paddingVertical: 100,
    alignItems: 'center',
  },
});
