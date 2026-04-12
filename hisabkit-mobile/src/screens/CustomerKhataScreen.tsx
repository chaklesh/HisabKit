import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  updateCustomer,
  deleteCustomer,
  fetchTransactionAttachments,
} from '../services/ledger';
import type { LedgerTransaction, Customer, TransactionAttachment } from '../types/ledger';
import type { LedgerStackParamList } from '../navigation/AppNavigator';
import { formatCurrency } from '../utils/format';
import { useTheme } from '../context/ThemeContext';
import { ENV } from '../config/env';

type Props = NativeStackScreenProps<LedgerStackParamList, 'CustomerKhata'>;
type TxnType = 'SALE' | 'PAYMENT';

type PendingAttachment = {
  uri: string;
  name: string;
  type: string;
};

const emptyCustomerForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
};

export function CustomerKhataScreen({ route, navigation }: Props) {
  const { customer: initialCustomer }: { customer: Customer } = route.params;
  const { colors } = useTheme();
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [attachmentsByTxn, setAttachmentsByTxn] = useState<Record<string, TransactionAttachment[]>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [txnType, setTxnType] = useState<TxnType>('SALE');
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [paidNow, setPaidNow] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [submittingTxn, setSubmittingTxn] = useState(false);
  const [deletingTxnId, setDeletingTxnId] = useState<string | null>(null);
  const [deletingCustomerState, setDeletingCustomerState] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);

  const load = useCallback(async () => {
    const data = await fetchTransactions(customer.id);
    setTransactions(data);

    const attachmentEntries = await Promise.all(
      data.map(async (txn) => {
        try {
          const files = await fetchTransactionAttachments(txn.id);
          return [txn.id, files] as const;
        } catch {
          return [txn.id, []] as const;
        }
      })
    );

    setAttachmentsByTxn(Object.fromEntries(attachmentEntries));
  }, [customer.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        if (item.type === 'SALE') {
          acc.sales += Number(item.totalAmount ?? 0);
          acc.received += Number(item.paidAmount ?? 0);
          acc.pending += Number(item.dueAmount ?? 0);
        } else {
          acc.payments += Number(item.paidAmount ?? 0);
          acc.received += Number(item.paidAmount ?? 0);
        }
        return acc;
      },
      { sales: 0, payments: 0, received: 0, pending: 0 }
    );
  }, [transactions]);

  const computedBalance = useMemo(() => {
    return transactions.reduce((balance, txn) => {
      if (txn.type === 'SALE') {
        return balance + Number(txn.dueAmount ?? 0);
      }
      return balance - Number(txn.paidAmount ?? 0);
    }, 0);
  }, [transactions]);

  const currentBalance = computedBalance;
  const isAdvance = currentBalance < 0;
  const parsedAmount = Number(amount || 0);
  const parsedPaidNow = Number(paidNow || 0);
  const dueAfterSale = txnType === 'SALE' ? Math.max(parsedAmount - parsedPaidNow, 0) : 0;

  const refreshCustomerBalance = useCallback(
    (fallbackTransactions?: LedgerTransaction[]) => {
      const source = fallbackTransactions ?? transactions;
      const balance = source.reduce((sum, txn) => {
        if (txn.type === 'SALE') return sum + Number(txn.dueAmount ?? 0);
        return sum - Number(txn.paidAmount ?? 0);
      }, 0);
      setCustomer((prev) => ({ ...prev, totalBalance: balance }));
    },
    [transactions]
  );

  const closeForm = useCallback(() => {
    setModalVisible(false);
    setEditingTxnId(null);
    setTxnType('SALE');
    setAmount('');
    setPaidNow('');
    setDescription('');
    setAttachment(null);
    setTransactionDate(new Date());
    setShowDatePicker(false);
  }, []);

  const openForm = (type: TxnType, txn?: LedgerTransaction) => {
    setTxnType(txn?.type ?? type);
    setEditingTxnId(txn?.id ?? null);
    setAmount(txn ? String(Number(txn.type === 'PAYMENT' ? txn.paidAmount : txn.totalAmount)) : '');
    setPaidNow(txn ? String(Number(txn.type === 'SALE' ? txn.paidAmount : 0)) : '');
    setDescription(txn?.description ?? '');
    setTransactionDate(txn ? new Date(txn.timestamp) : new Date());
    setAttachment(null);
    setModalVisible(true);
  };

  const openCustomerForm = () => {
    setCustomerForm({
      name: customer.name ?? '',
      phone: customer.phone ?? '',
      email: customer.email ?? '',
      address: customer.address ?? '',
      gstNumber: customer.gstNumber ?? '',
    });
    setCustomerModalVisible(true);
  };

  const closeCustomerForm = () => {
    setCustomerModalVisible(false);
    setCustomerForm(emptyCustomerForm);
  };

  const handleCaptureImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera access is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setAttachment({
        uri: asset.uri,
        name: asset.fileName || `camera_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setAttachment({
        uri: asset.uri,
        name: asset.fileName || `gallery_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setAttachment({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      });
    }
  };

  const handleSaveTxn = async () => {
    if (submittingTxn) return;

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (txnType === 'SALE' && (Number.isNaN(parsedPaidNow) || parsedPaidNow < 0 || parsedPaidNow > parsedAmount)) {
      Alert.alert('Error', 'Paid now must be between 0 and total sale amount');
      return;
    }

    setSubmittingTxn(true);
    try {
      const payload = {
        customerId: customer.id,
        type: txnType,
        totalAmount: parsedAmount,
        paidAmount: txnType === 'PAYMENT' ? parsedAmount : parsedPaidNow,
        description: description.trim() || undefined,
        transactionDate: transactionDate.toISOString().split('T')[0],
        attachment: attachment || undefined,
      };

      const result = editingTxnId
        ? await updateTransaction(editingTxnId, payload)
        : await createTransaction(payload);

      closeForm();
      await load();
      refreshCustomerBalance();

      if (result.attachmentUploadFailed) {
        Alert.alert(
          'Saved with warning',
          'Transaction was saved, but the photo/file could not be uploaded. You can edit the transaction and try again.'
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'OFFLINE_QUEUED') {
        Alert.alert('Offline Mode', 'Transaction saved to queue and will sync automatically.');
        closeForm();
      } else {
        Alert.alert('Error', editingTxnId ? 'Failed to update transaction. Please try again.' : 'Failed to create transaction. Please try again.');
      }
    } finally {
      setSubmittingTxn(false);
    }
  };

  const handleDeleteTxn = (txn: LedgerTransaction) => {
    Alert.alert(
      'Delete transaction',
      'Remove this entry from the customer khata?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (deletingTxnId) return;
            setDeletingTxnId(txn.id);
            try {
              await deleteTransaction(txn.id);
              const nextTransactions = transactions.filter((item) => item.id !== txn.id);
              setTransactions(nextTransactions);
              setAttachmentsByTxn((prev) => {
                const next = { ...prev };
                delete next[txn.id];
                return next;
              });
              refreshCustomerBalance(nextTransactions);
            } catch {
              Alert.alert('Error', 'Unable to delete transaction right now.');
            } finally {
              setDeletingTxnId(null);
            }
          },
        },
      ]
    );
  };

  const handleSaveCustomer = async () => {
    if (savingCustomer) return;
    if (!customerForm.name.trim()) {
      Alert.alert('Error', 'Customer name is required');
      return;
    }

    setSavingCustomer(true);
    try {
      const updated = await updateCustomer(customer.id, {
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim() || undefined,
        email: customerForm.email.trim() || undefined,
        address: customerForm.address.trim() || undefined,
        gstNumber: customerForm.gstNumber.trim() || undefined,
      });
      setCustomer((prev) => ({ ...prev, ...updated }));
      closeCustomerForm();
      Alert.alert('Updated', 'Customer details saved.');
    } catch {
      Alert.alert('Error', 'Unable to update customer right now.');
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleDeleteCustomer = () => {
    Alert.alert(
      'Delete customer',
      `Delete ${customer.name} and all related transactions? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (deletingCustomerState) return;
            setDeletingCustomerState(true);
            try {
              await deleteCustomer(customer.id);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Unable to delete customer right now.');
            } finally {
              setDeletingCustomerState(false);
            }
          },
        },
      ]
    );
  };

  const onDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTransactionDate(selectedDate);
    }
  };

  const openAttachment = async (attachmentItem: TransactionAttachment) => {
    if (!attachmentItem.id) return;
    const url = `${ENV.API_BASE_URL}/ledger/attachments/${attachmentItem.id}/content`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Could not open attachment.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.customerName, { color: colors.text }]}>{customer.name}</Text>
          <Text style={[styles.customerPhone, { color: colors.textMuted }]}>{customer.phone || customer.email || 'No contact added'}</Text>
        </View>
        <TouchableOpacity style={[styles.headerAction, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]} onPress={openCustomerForm}>
          <MaterialCommunityIcons name="account-edit-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.balanceContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.balanceTitleRow}>
          <View style={styles.flexOne}>
            <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>Current balance</Text>
            <Text style={[styles.balanceAmount, { color: isAdvance ? colors.success : colors.danger }]}>
              {formatCurrency(Math.abs(currentBalance))}
            </Text>
            <Text style={[styles.balanceSubtext, { color: colors.textMuted }]}>
              {currentBalance === 0 ? 'Customer account is settled' : isAdvance ? 'Customer has advance with you' : 'Customer still has payment due'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.deleteCustomerBtn, { backgroundColor: colors.dangerSoft, borderColor: colors.border }]} onPress={handleDeleteCustomer} disabled={deletingCustomerState}>
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
            <Text style={[styles.deleteCustomerText, { color: colors.danger }]}>{deletingCustomerState ? 'Deleting...' : 'Delete'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.topStats}>
          <MiniMetric label="Sales" value={formatCurrency(totals.sales)} tone={colors.brand} colors={colors} />
          <MiniMetric label="Received" value={formatCurrency(totals.received)} tone={colors.success} colors={colors} />
          <MiniMetric label="Pending" value={formatCurrency(totals.pending)} tone={colors.danger} colors={colors} />
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => {
          const isSale = item.type === 'SALE';
          const attachmentCount = attachmentsByTxn[item.id]?.length ?? 0;

          return (
            <View style={[styles.txnCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.txnTopRow}>
                <View style={styles.txnLeft}>
                  <Text style={[styles.txnDate, { color: colors.textMuted }]}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                  <Text style={[styles.txnDesc, { color: colors.text }]}>{item.description || (isSale ? 'Sale entry' : 'Payment received')}</Text>
                  <Text style={[styles.txnRef, { color: colors.textMuted }]}>{item.referenceNo}</Text>
                </View>
                <View style={styles.txnRight}>
                  <Text style={[styles.txnAmount, { color: isSale ? colors.danger : colors.success }]}>
                    {formatCurrency(isSale ? item.totalAmount : item.paidAmount)}
                  </Text>
                  <Text style={[styles.txnType, { color: isSale ? colors.danger : colors.success }]}>
                    {isSale ? 'YOU GAVE' : 'YOU GOT'}
                  </Text>
                </View>
              </View>

              <View style={styles.txnMetaRow}>
                {isSale && Number(item.paidAmount ?? 0) > 0 ? (
                  <Text style={[styles.txnDue, { color: colors.success }]}>Received now: {formatCurrency(item.paidAmount)}</Text>
                ) : null}
                {isSale && Number(item.dueAmount ?? 0) > 0 ? (
                  <Text style={[styles.txnDue, { color: colors.warning }]}>Due left: {formatCurrency(item.dueAmount)}</Text>
                ) : null}
                {!isSale ? (
                  <Text style={[styles.txnDue, { color: colors.textMuted }]}>Payment recorded</Text>
                ) : null}
              </View>

              {attachmentCount > 0 ? (
                <View style={styles.attachmentList}>
                  {attachmentsByTxn[item.id].map((file) => (
                    <TouchableOpacity
                      key={file.id}
                      style={[styles.attachmentChip, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}
                      onPress={() => openAttachment(file)}
                    >
                      <MaterialCommunityIcons name="paperclip" size={16} color={colors.brand} />
                      <Text style={[styles.attachmentChipText, { color: colors.text }]} numberOfLines={1}>
                        {file.fileName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              <View style={styles.txnActions}>
                <TouchableOpacity style={[styles.txnActionBtn, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]} onPress={() => openForm(item.type, item)}>
                  <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.text} />
                  <Text style={[styles.txnActionText, { color: colors.text }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.txnActionBtn, { backgroundColor: colors.dangerSoft, borderColor: colors.border }, deletingTxnId === item.id && styles.disabledBtn]}
                  onPress={() => handleDeleteTxn(item)}
                  disabled={deletingTxnId === item.id}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
                  <Text style={[styles.txnActionText, { color: colors.danger }]}>
                    {deletingTxnId === item.id ? 'Deleting...' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textMuted }]}>No transactions yet.</Text>}
      />

      <View style={[styles.actionFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.btnRed, { backgroundColor: colors.danger }]} onPress={() => openForm('SALE')}>
          <MaterialCommunityIcons name="arrow-right-bold-circle-outline" size={20} color={colors.onBrand} />
          <View>
            <Text style={[styles.btnLabel, { color: colors.onBrand }]}>YOU GAVE</Text>
            <Text style={[styles.btnSubLabel, { color: colors.onBrand }]}>Sale / udhaar</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnGreen, { backgroundColor: colors.success }]} onPress={() => openForm('PAYMENT')}>
          <MaterialCommunityIcons name="arrow-down-bold-circle-outline" size={20} color={colors.onBrand} />
          <View>
            <Text style={[styles.btnLabel, { color: colors.onBrand }]}>YOU GOT</Text>
            <Text style={[styles.btnSubLabel, { color: colors.onBrand }]}>Payment</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeForm}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTxnId ? 'Edit transaction' : txnType === 'SALE' ? 'Create sale entry' : 'Record payment'}
              </Text>
              <TouchableOpacity onPress={closeForm}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={[styles.inputAmount, { color: txnType === 'SALE' ? colors.danger : colors.success, borderBottomColor: colors.border }]}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus
                editable={!submittingTxn}
              />

              {txnType === 'SALE' ? (
                <>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Collected now</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={paidNow}
                    onChangeText={setPaidNow}
                    editable={!submittingTxn}
                  />
                  <View style={[styles.saleSummary, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
                    <Text style={[styles.saleSummaryText, { color: colors.textMuted }]}>Remaining due</Text>
                    <Text style={[styles.saleSummaryValue, { color: colors.danger }]}>{formatCurrency(dueAfterSale)}</Text>
                  </View>
                </>
              ) : null}

              <TouchableOpacity style={[styles.pickerField, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={() => setShowDatePicker(true)} disabled={submittingTxn}>
                <MaterialCommunityIcons name="calendar" size={20} color={colors.brand} />
                <Text style={[styles.pickerText, { color: colors.text }]}>{transactionDate.toDateString()}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={transactionDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}

              <TextInput
                style={[styles.inputDesc, { color: colors.text, backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                placeholder={txnType === 'SALE' ? 'Item name, bill number, remark' : 'Payment note or reference'}
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                editable={!submittingTxn}
              />

              <View style={styles.attachmentSection}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Attachment</Text>
                <View style={styles.attachmentButtons}>
                  <TouchableOpacity style={[styles.attachBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={handleCaptureImage} disabled={submittingTxn}>
                    <MaterialCommunityIcons name="camera" size={24} color={colors.text} />
                    <Text style={[styles.attachBtnText, { color: colors.textMuted }]}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.attachBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={handlePickImage} disabled={submittingTxn}>
                    <MaterialCommunityIcons name="image" size={24} color={colors.text} />
                    <Text style={[styles.attachBtnText, { color: colors.textMuted }]}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.attachBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={handlePickDocument} disabled={submittingTxn}>
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color={colors.text} />
                    <Text style={[styles.attachBtnText, { color: colors.textMuted }]}>PDF</Text>
                  </TouchableOpacity>
                </View>

                {attachment && (
                  <View style={[styles.attachmentPreview, { backgroundColor: colors.successSoft, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="file-check" size={24} color={colors.success} />
                    <Text style={[styles.attachmentName, { color: colors.text }]} numberOfLines={1}>{attachment.name}</Text>
                    <TouchableOpacity onPress={() => setAttachment(null)} disabled={submittingTxn}>
                      <MaterialCommunityIcons name="delete" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: txnType === 'SALE' ? colors.danger : colors.success },
                  submittingTxn && styles.disabledBtn,
                ]}
                onPress={handleSaveTxn}
                disabled={submittingTxn}
              >
                <Text style={[styles.saveBtnText, { color: colors.onBrand }]}>
                  {submittingTxn
                    ? 'Saving...'
                    : editingTxnId
                      ? 'Update transaction'
                      : txnType === 'SALE'
                        ? 'Save sale entry'
                        : 'Save payment entry'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={customerModalVisible} animationType="slide" transparent onRequestClose={closeCustomerForm}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.customerModalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit customer</Text>
              <TouchableOpacity onPress={closeCustomerForm}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput style={[styles.inputField, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Name *" placeholderTextColor={colors.textMuted} value={customerForm.name} onChangeText={(value) => setCustomerForm((prev) => ({ ...prev, name: value }))} editable={!savingCustomer} />
            <TextInput style={[styles.inputField, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Phone" placeholderTextColor={colors.textMuted} value={customerForm.phone} onChangeText={(value) => setCustomerForm((prev) => ({ ...prev, phone: value }))} keyboardType="phone-pad" editable={!savingCustomer} />
            <TextInput style={[styles.inputField, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Email" placeholderTextColor={colors.textMuted} value={customerForm.email} onChangeText={(value) => setCustomerForm((prev) => ({ ...prev, email: value }))} keyboardType="email-address" autoCapitalize="none" editable={!savingCustomer} />
            <TextInput style={[styles.inputField, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Address" placeholderTextColor={colors.textMuted} value={customerForm.address} onChangeText={(value) => setCustomerForm((prev) => ({ ...prev, address: value }))} editable={!savingCustomer} />
            <TextInput style={[styles.inputField, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="GST Number" placeholderTextColor={colors.textMuted} value={customerForm.gstNumber} onChangeText={(value) => setCustomerForm((prev) => ({ ...prev, gstNumber: value }))} autoCapitalize="characters" editable={!savingCustomer} />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.brand }, savingCustomer && styles.disabledBtn]} onPress={handleSaveCustomer} disabled={savingCustomer}>
              <Text style={[styles.saveBtnText, { color: colors.onBrand }]}>{savingCustomer ? 'Saving...' : 'Save changes'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MiniMetric({
  label,
  value,
  tone,
  colors,
}: {
  label: string;
  value: string;
  tone: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: tone }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flexOne: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, gap: 10 },
  backBtn: { paddingRight: 4 },
  headerTitleContainer: { flex: 1 },
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  customerName: { fontSize: 20, fontWeight: '900' },
  customerPhone: { fontSize: 13 },
  balanceContainer: { padding: 20, margin: 16, borderRadius: 22, borderWidth: 1, gap: 12 },
  balanceTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  balanceLabel: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  balanceAmount: { fontSize: 36, fontWeight: '900' },
  balanceSubtext: { fontSize: 13 },
  deleteCustomerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  deleteCustomerText: { fontSize: 12, fontWeight: '800' },
  topStats: { flexDirection: 'row', gap: 8, marginTop: 4 },
  metricCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12, gap: 4 },
  metricLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  metricValue: { fontSize: 14, fontWeight: '900' },
  listContent: { paddingHorizontal: 16, paddingBottom: 130 },
  txnCard: { padding: 16, marginBottom: 10, borderRadius: 18, borderWidth: 1, gap: 12 },
  txnTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  txnLeft: { flex: 1, gap: 3 },
  txnDate: { fontSize: 12 },
  txnDesc: { fontSize: 16, fontWeight: '800' },
  txnRef: { fontSize: 11 },
  txnRight: { alignItems: 'flex-end', justifyContent: 'center', gap: 2 },
  txnAmount: { fontSize: 18, fontWeight: '900' },
  txnType: { fontSize: 11, fontWeight: '800' },
  txnMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  txnDue: { fontSize: 12, fontWeight: '700' },
  attachmentList: { gap: 8 },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  attachmentChipText: { flex: 1, fontSize: 13, fontWeight: '600' },
  txnActions: { flexDirection: 'row', gap: 10 },
  txnActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
  },
  txnActionText: { fontSize: 13, fontWeight: '800' },
  emptyText: { textAlign: 'center', marginTop: 40 },
  actionFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, paddingBottom: 32, gap: 12, borderTopWidth: 1 },
  btnRed: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16 },
  btnGreen: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16 },
  btnLabel: { fontSize: 13, fontWeight: '900' },
  btnSubLabel: { fontSize: 11 },
  fieldLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  pickerField: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1 },
  pickerText: { fontSize: 15, fontWeight: '600' },
  inputField: { borderWidth: 1, borderRadius: 12, fontSize: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  saleSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 },
  saleSummaryText: { fontSize: 13, fontWeight: '700' },
  saleSummaryValue: { fontSize: 16, fontWeight: '900' },
  attachmentSection: { marginBottom: 24 },
  attachmentButtons: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  attachBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 12, borderWidth: 1 },
  attachBtnText: { fontSize: 12, fontWeight: '600' },
  attachmentPreview: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12, borderWidth: 1 },
  attachmentName: { fontSize: 13, flex: 1, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  customerModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  inputAmount: { fontSize: 40, fontWeight: '900', borderBottomWidth: 1, paddingBottom: 8, marginBottom: 20 },
  inputDesc: { fontSize: 16, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1 },
  saveBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '800' },
  disabledBtn: { opacity: 0.6 },
});
