import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  BookOpen,
  ChevronLeft,
  MessageSquare,
  MinusCircle,
  MoreVertical,
  Phone,
  PlusCircle,
  Share2,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Avatar,
  Dialog,
  Divider,
  IconButton,
  Menu,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import type { LedgerStackParamList } from "../../../app/navigation/RootNavigator";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Screen } from "../../../shared/components/ui/Screen";
import { ENV } from "../../../shared/config/env";
import type {
  Customer,
  LedgerTransaction,
  TransactionAttachment,
} from "../../../shared/types/ledger";
import { formatCurrency } from "../../../utils/format";
import { KhataHeader } from "../components/KhataHeader";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionItem } from "../components/TransactionItem";
import { useCustomerMutations } from "../hooks/useCustomerMutations";
import { useTransactionData } from "../hooks/useTransactionData";
import { useTransactionMutations } from "../hooks/useTransactionMutations";

interface TransactionFormData {
  type: "SALE" | "PAYMENT";
  totalAmount: number;
  description: string;
  transactionDate: string;
  attachment?: {
    uri: string;
    name: string;
    type: string;
  };
}

type Props = NativeStackScreenProps<LedgerStackParamList, "CustomerKhata">;

export function CustomerKhataScreen({ route, navigation }: Props) {
  const { customer: initialCustomer } = route.params;
  const theme = useTheme();
  const { t } = useTranslation();

  // Data & Mutations
  const { transactions, attachments, stats, currentBalance, isLoading, refetch, isRefreshing } =
    useTransactionData(initialCustomer.id);

  const {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isSubmitting: isTxnSaving,
  } = useTransactionMutations(initialCustomer.id);
  const {
    updateCustomer,
    deleteCustomer,

    isSaving: isCustomerSaving,

    isDeleting: isCustomerDeleting,
  } = useCustomerMutations();

  // Local State
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [txnType, setTxnType] = useState<"SALE" | "PAYMENT">("SALE");
  const [editingTxn, setEditingTxn] = useState<LedgerTransaction | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: initialCustomer.name,
    phone: initialCustomer.phone || "",
    address: initialCustomer.address || "",
  });

  const handleAddTxn = (type: "SALE" | "PAYMENT") => {
    setTxnType(type);
    setEditingTxn(null);
    setShowTxnForm(true);
  };

  const handleEditTxn = (txn: LedgerTransaction) => {
    setEditingTxn(txn);
    setShowTxnForm(true);
  };

  const handleSaveTxn = async (data: TransactionFormData) => {
    try {
      if (editingTxn) {
        await updateTransaction({
          id: editingTxn.id,
          data: { ...data, customerId: initialCustomer.id },
        });
      } else {
        await createTransaction({ ...data, customerId: initialCustomer.id });
      }
      setShowTxnForm(false);
    } catch (_e) {}
  };

  const handleDeleteTxn = (txn: LedgerTransaction) => {
    Alert.alert(
      t("ledger.transaction.delete_entry", "Delete Entry"),
      t("common.confirm_action", "Are you sure?"),
      [
        { text: t("common.cancel", "Cancel"), style: "cancel" },
        {
          text: t("ledger.buttons.delete", "Delete"),
          style: "destructive",
          onPress: () => deleteTransaction(txn.id),
        },
      ],
    );
  };

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, LedgerTransaction[]> = {};
    transactions.forEach((t) => {
      const date = new Date(t.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });
    return Object.entries(groups).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
    );
  }, [transactions]);

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return t("common.today", "TODAY");
    if (date.toDateString() === yesterday.toDateString()) return t("common.yesterday", "YESTERDAY");
    return date
      .toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
      .toUpperCase();
  };

  return (
    <Screen style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerTop}>
          <IconButton
            icon={() => <ChevronLeft color="white" size={24} />}
            onPress={() => navigation.goBack()}
          />
          <Text variant="titleLarge" style={styles.headerTitle}>
            {t("ledger.transaction.details", "Account Details")}
          </Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon={() => <MoreVertical color="white" size={24} />}
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                setShowCustomerForm(true);
              }}
              title={t("ledger.customer.edit_title", "Edit Profile")}
              leadingIcon="pencil"
            />
            <Divider />
            <Menu.Item
              onPress={async () => {
                setMenuVisible(false);
                const report = `${t("ledger.report.statement_for", "Ledger Statement for")} ${initialCustomer.name}\n${t("ledger.customer.balance", "Balance")}: ${formatCurrency(Math.abs(currentBalance))} (${currentBalance >= 0 ? t("ledger.customer.give", "GIVE") : t("ledger.customer.get", "GET")})\n\n${t("ledger.report.generated_via", "Generated via HisabKit")}`;
                try {
                  await Share.share({ message: report });
                } catch (_e) {}
              }}
              title={t("ledger.report.share", "Share Report")}
              leadingIcon="share-variant"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                Alert.alert(
                  t("ledger.customer.delete", "Delete Customer"),
                  t("common.confirm_action", "Are you sure?"),
                  [
                    { text: t("common.cancel", "Cancel"), style: "cancel" },
                    {
                      text: t("ledger.buttons.delete", "Delete"),
                      style: "destructive",
                      onPress: async () => {
                        await deleteCustomer(initialCustomer.id);
                        navigation.goBack();
                      },
                    },
                  ],
                );
              }}
              title={t("ledger.customer.delete", "Delete Customer")}
              leadingIcon="trash-can"
              titleStyle={{ color: "#ef4444" }}
            />
          </Menu>
        </View>

        <View style={styles.headerProfile}>
          <View style={styles.avatarWrapper}>
            <Avatar.Text
              size={64}
              label={initialCustomer.name.slice(0, 1).toUpperCase()}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.onlineBadge} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text variant="headlineSmall" style={styles.profileName}>
              {initialCustomer.name}
            </Text>
            <View style={styles.profileMeta}>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${initialCustomer.phone}`)}
                style={styles.metaAction}
              >
                <Phone size={14} color="rgba(255,255,255,0.8)" />
                <Text variant="labelSmall" style={styles.metaText}>
                  {initialCustomer.phone || t("ledger.customer.no_phone", "NO PHONE")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.metaAction}
                onPress={() => {
                  const msg = `Dear ${initialCustomer.name}, your balance is ${formatCurrency(Math.abs(currentBalance))} (${currentBalance >= 0 ? t("ledger.customer.give", "GIVE") : t("ledger.customer.get", "GET")}).`;
                  Linking.openURL(`sms:${initialCustomer.phone}?body=${encodeURIComponent(msg)}`);
                }}
              >
                <MessageSquare size={14} color="rgba(255,255,255,0.8)" />
                <Text variant="labelSmall" style={styles.metaText}>
                  {t("ledger.customer.send_nudge", "SEND NUDGE")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.glassBalance}>
          <View>
            <Text variant="labelSmall" style={styles.balanceLabel}>
              {t("ledger.customer.net_outstanding", "NET OUTSTANDING")}
            </Text>
            <Text variant="displaySmall" style={styles.balanceVal}>
              {formatCurrency(Math.abs(currentBalance))}
            </Text>
          </View>
          <View
            style={[
              styles.balancePill,
              { backgroundColor: currentBalance >= 0 ? "#fee2e2" : "#d1fae5" },
            ]}
          >
            <Text
              variant="labelMedium"
              style={{ color: currentBalance >= 0 ? "#ef4444" : "#10b981", fontWeight: "900" }}
            >
              {currentBalance >= 0
                ? t("ledger.customer.give", "GIVE")
                : t("ledger.customer.get", "GET")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={groupedTransactions}
          keyExtractor={(item) => item[0]}
          renderItem={({ item: [date, txns] }) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <View style={styles.dateLine} />
                <View style={styles.datePill}>
                  <Text variant="labelSmall" style={styles.dateLabel}>
                    {getDayLabel(date)}
                  </Text>
                </View>
                <View style={styles.dateLine} />
              </View>
              {txns.map((txn: LedgerTransaction) => (
                <TransactionItem
                  key={txn.id}
                  transaction={txn}
                  attachments={attachments[txn.id] || []}
                  onEdit={handleEditTxn}
                  onDelete={handleDeleteTxn}
                  onOpenAttachment={(file) =>
                    Linking.openURL(`${ENV.API_BASE_URL}/ledger/attachments/${file.id}/content`)
                  }
                />
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <BookOpen size={48} color="#e2e8f0" />
              <Text
                variant="bodyLarge"
                style={{ color: "#94a3b8", marginTop: 12, fontWeight: "700" }}
              >
                {t("ledger.transaction.no_history", "No recording history")}
              </Text>
            </View>
          }
        />
      </View>

      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.footerBtn, { backgroundColor: "#ef4444" }]}
          onPress={() => handleAddTxn("SALE")}
          activeOpacity={0.8}
        >
          <View style={styles.footerIconBox}>
            <PlusCircle color="#ef4444" size={20} />
          </View>
          <Text variant="titleMedium" style={styles.footerBtnText}>
            {t("ledger.customer.you_gave", "You Gave")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerBtn, { backgroundColor: "#10b981" }]}
          onPress={() => handleAddTxn("PAYMENT")}
          activeOpacity={0.8}
        >
          <View style={styles.footerIconBox}>
            <MinusCircle color="#10b981" size={20} />
          </View>
          <Text variant="titleMedium" style={styles.footerBtnText}>
            {t("ledger.customer.you_got", "You Got")}
          </Text>
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
        <Dialog
          visible={showCustomerForm}
          onDismiss={() => setShowCustomerForm(false)}
          style={{ borderRadius: 28 }}
        >
          <Dialog.Title style={{ fontWeight: "900" }}>
            {t("ledger.customer.edit_title", "Edit Profile")}
          </Dialog.Title>
          <Dialog.Content>
            <Input
              label={t("ledger.customer.name", "Name")}
              value={customerForm.name}
              onChangeText={(t) => setCustomerForm({ ...customerForm, name: t })}
            />
            <Input
              label={t("ledger.customer.phone", "Phone")}
              value={customerForm.phone}
              onChangeText={(t) => setCustomerForm({ ...customerForm, phone: t })}
              keyboardType="phone-pad"
            />
            <Input
              label={t("ledger.customer.address", "Address")}
              value={customerForm.address}
              onChangeText={(t) => setCustomerForm({ ...customerForm, address: t })}
            />
          </Dialog.Content>
          <Dialog.Actions style={{ padding: 20 }}>
            <Button mode="text" onPress={() => setShowCustomerForm(false)} style={{ flex: 1 }}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              onPress={async () => {
                await updateCustomer({ id: initialCustomer.id, data: customerForm });
                setShowCustomerForm(false);
              }}

              loading={isCustomerSaving}
              style={{ flex: 1 }}
            >
              {t("common.update", "Update")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 12,
    paddingBottom: 28,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    ...Platform.select({
      web: { boxShadow: "0 10px 30px rgba(79, 70, 229, 0.2)" },
      default: { elevation: 12 },
    }),
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  headerTitle: {
    color: "white",
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerProfile: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    marginTop: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    backgroundColor: "white",
    ...Platform.select({
      web: { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
      default: { elevation: 6 },
    }),
  },
  avatarLabel: {
    color: "#4f46e5",
    fontWeight: "900",
    fontSize: 24,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "white",
  },
  profileName: {
    color: "white",
    fontWeight: "900",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  profileMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 6,
  },
  metaAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  metaText: {
    color: "white",
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  glassBalance: {
    marginTop: 28,
    marginHorizontal: 28,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "900",
    letterSpacing: 1.5,
    fontSize: 10,
  },
  balanceVal: {
    color: "white",
    fontWeight: "900",
    marginTop: 4,
  },
  balancePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    ...Platform.select({
      web: { boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
      default: { elevation: 4 },
    }),
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  datePill: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginHorizontal: 12,
  },
  dateLabel: {
    color: "#64748b",
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    ...Platform.select({
      web: {
        boxShadow: "0 -10px 25px rgba(0,0,0,0.08)",
        backdropFilter: "blur(10px)",
      },
      default: { elevation: 20 },
    }),
  },
  footerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 22,
  },
  footerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
      default: { elevation: 2 },
    }),
  },
  footerBtnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  empty: {
    paddingVertical: 120,
    alignItems: "center",
  },
});
