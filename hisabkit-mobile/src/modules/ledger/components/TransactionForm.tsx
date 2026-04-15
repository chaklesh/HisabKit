import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Text, useTheme, Portal, Dialog } from 'react-native-paper';
import { Camera, Image as ImageIcon, FileText, Calendar as CalendarIcon, X, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { formatCurrency } from '../../../utils/format';
import type { LedgerTransaction } from '../../../shared/types/ledger';

interface TransactionFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialType: 'SALE' | 'PAYMENT';
  editingTransaction: LedgerTransaction | null;
  isLoading: boolean;
}

export const TransactionForm = ({
  visible,
  onClose,
  onSave,
  initialType,
  editingTransaction,
  isLoading,
}: TransactionFormProps) => {
  const theme = useTheme();
  
  const [txnType, setTxnType] = useState<'SALE' | 'PAYMENT'>(initialType);
  const [amount, setAmount] = useState('');
  const [paidNow, setPaidNow] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attachment, setAttachment] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      if (editingTransaction) {
        setTxnType(editingTransaction.type);
        setAmount(String(editingTransaction.type === 'PAYMENT' ? editingTransaction.paidAmount : editingTransaction.totalAmount));
        setPaidNow(String(editingTransaction.type === 'SALE' ? editingTransaction.paidAmount : 0));
        setDescription(editingTransaction.description || '');
        setTransactionDate(new Date(editingTransaction.timestamp));
        setAttachment(null);
      } else {
        setTxnType(initialType);
        setAmount('');
        setPaidNow('');
        setDescription('');
        setTransactionDate(new Date());
        setAttachment(null);
      }
    }
  }, [visible, editingTransaction, initialType]);

  const parsedAmount = Number(amount || 0);
  const parsedPaidNow = Number(paidNow || 0);
  const dueAfterSale = txnType === 'SALE' ? Math.max(parsedAmount - parsedPaidNow, 0) : 0;

  const handleCaptureImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera access is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setAttachment({ uri: asset.uri, name: `camera_${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' });
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setAttachment({ uri: asset.uri, name: `gallery_${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' });
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'] });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setAttachment({ uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream' });
    }
  };

  const handleSave = async () => {
    if (!amount || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const data = {
      type: txnType,
      totalAmount: parsedAmount,
      paidAmount: txnType === 'PAYMENT' ? parsedAmount : parsedPaidNow,
      description: description.trim(),
      transactionDate: transactionDate.toISOString().split('T')[0],
      attachment: attachment || undefined,
    };

    await onSave(data);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title style={{ textAlign: 'center', fontWeight: '900' }}>
          {editingTransaction ? 'Edit Entry' : txnType === 'SALE' ? 'New Sale' : 'New Payment'}
        </Dialog.Title>
        <Dialog.Content>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.amountContainer}>
              <Text variant="labelSmall" style={styles.label}>Amount</Text>
              <Input
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.amountInput}
                autoFocus
              />
            </View>

            {txnType === 'SALE' && (
              <View style={styles.inputGroup}>
                <Text variant="labelSmall" style={styles.label}>Collected Now</Text>
                <Input
                  placeholder="0.00"
                  value={paidNow}
                  onChangeText={setPaidNow}
                  keyboardType="numeric"
                />
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Remaining Due:</Text>
                  <Text variant="bodySmall" style={{ fontWeight: '800', color: '#ef4444' }}>{formatCurrency(dueAfterSale)}</Text>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text variant="labelSmall" style={styles.label}>Description</Text>
              <Input
                placeholder="What is this for?"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity 
              style={[styles.dateBtn, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]} 
              onPress={() => setShowDatePicker(true)}
            >
              <CalendarIcon size={20} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{transactionDate.toDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={transactionDate}
                mode="date"
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setTransactionDate(date);
                }}
                maximumDate={new Date()}
              />
            )}
            
            {showDatePicker && Platform.OS === 'web' && (
              <Portal>
                <Dialog visible={showDatePicker} onDismiss={() => setShowDatePicker(false)}>
                  <Dialog.Title>Select Date</Dialog.Title>
                  <Dialog.Content>
                    <Input 
                      label="YYYY-MM-DD" 
                      value={transactionDate.toISOString().split('T')[0]} 
                      onChangeText={(t) => {
                        const d = new Date(t);
                        if (!isNaN(d.getTime())) setTransactionDate(d);
                      }}
                    />
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button onPress={() => setShowDatePicker(false)}>Done</Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
            )}

            <View style={styles.attachmentSection}>
              <Text variant="labelSmall" style={styles.label}>Attach Receipt</Text>
              <View style={styles.attachRow}>
                <AttachOption icon={<Camera size={20} />} label="Camera" onPress={handleCaptureImage} />
                <AttachOption icon={<ImageIcon size={20} />} label="Gallery" onPress={handlePickImage} />
                <AttachOption icon={<FileText size={20} />} label="PDF" onPress={handlePickDocument} />
              </View>

              {attachment && (
                <View style={[styles.preview, { backgroundColor: '#f0fdf4' }]}>
                  <Check size={16} color="#10b981" />
                  <Text variant="bodySmall" style={{ flex: 1, color: '#166534' }} numberOfLines={1}>{attachment.name}</Text>
                  <TouchableOpacity onPress={() => setAttachment(null)}>
                    <X size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button mode="text" onPress={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button 
            onPress={handleSave} 
            loading={isLoading} 
            style={{ flex: 2, backgroundColor: txnType === 'SALE' ? '#ef4444' : '#10b981' }}
          >
            Save Entry
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const AttachOption = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.attachOption} onPress={onPress}>
    <View style={styles.iconCircle}>{icon}</View>
    <Text variant="labelSmall" style={{ color: '#64748b' }}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 28,
    maxHeight: '85%',
  },
  amountContainer: {
    marginBottom: 20,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '900',
  },
  label: {
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  attachmentSection: {
    marginBottom: 8,
  },
  attachRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  attachOption: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
});
