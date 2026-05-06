import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Phone, Plus, Users } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Avatar,
  Dialog,
  type MD3Theme,
  Portal,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import type { LedgerStackParamList } from "../../../app/navigation/RootNavigator";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Screen } from "../../../shared/components/ui/Screen";
import type { Customer } from "../../../shared/types/ledger";
import { formatCurrency } from "../../../utils/format";
import { useCustomerMutations } from "../hooks/useCustomerMutations";
import { type FilterMode, useLedgerData } from "../hooks/useLedgerData";

type Props = NativeStackScreenProps<LedgerStackParamList, "LedgerList">;

export function LedgerListScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    filteredCustomers,
    totals,
    search,
    setSearch,
    filterMode,
    setFilterMode,
    refetch,
    isRefreshing,
  } = useLedgerData();

  const { createCustomer, isSaving } = useCustomerMutations();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    gstNumber: "",
    email: "",
  });

  const handleOpenForm = () => {
    setFormData({ name: "", phone: "", address: "", gstNumber: "", email: "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    try {
      await createCustomer(formData);
      setShowForm(false);
    } catch (_e) {}
  };

  const netBalance = totals.collect - totals.pay;

  return (
    <Screen style={styles.container}>
      {/* Premium Hero Header */}
      <LinearGradient
        colors={[theme.colors.primary, "#4338ca"]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.heroTop}>
            <View>
              <Text variant="labelMedium" style={styles.heroSub}>
                {t("ledger.dashboard.net_balance", "MY NET BALANCE")}
              </Text>
              <Text variant="displaySmall" style={styles.heroBalance}>
                {formatCurrency(Math.abs(netBalance))}
              </Text>
              <View
                style={[
                  styles.netBadge,
                  { backgroundColor: netBalance >= 0 ? "#10b981" : "#ef4444" },
                ]}
              >
                <Text style={styles.netBadgeText}>
                  {netBalance >= 0
                    ? t("ledger.customer.get", "YOU GET")
                    : t("ledger.customer.give", "YOU GIVE")}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.addHeroBtn} onPress={handleOpenForm}>
              <Plus color="white" size={24} strokeWidth={3} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text variant="labelSmall" style={styles.heroStatLabel}>
                {t("ledger.customer.to_collect", "TO COLLECT")}
              </Text>
              <Text variant="titleMedium" style={styles.heroStatValue}>
                {formatCurrency(totals.collect)}
              </Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text variant="labelSmall" style={styles.heroStatLabel}>
                {t("ledger.customer.to_pay", "TO PAY")}
              </Text>
              <Text variant="titleMedium" style={styles.heroStatValue}>
                {formatCurrency(totals.pay)}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.searchSection}>
          <Searchbar
            placeholder={t("ledger.dashboard.search_placeholder", "Search accounts or numbers...")}
            onChangeText={setSearch}
            value={search}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#94a3b8"
            placeholderTextColor="#94a3b8"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {(["ALL", "COLLECT", "PAY", "SETTLED"] as FilterMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setFilterMode(mode)}
                style={[
                  styles.filterChip,
                  filterMode === mode && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Text style={[styles.filterText, filterMode === mode && { color: "white" }]}>
                  {t(`ledger.filters.${mode.toLowerCase()}`, mode)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {filteredCustomers.length === 0 ? (
            <View style={styles.empty}>
              <Users size={64} color="#e2e8f0" />
              <Text variant="titleMedium" style={styles.emptyText}>
                {t("ledger.dashboard.no_accounts", "No accounts found")}
              </Text>
            </View>
          ) : (
            filteredCustomers.map((customer) => (
              <CustomerAccountCard
                key={customer.id}
                customer={customer}
                onPress={() => navigation.navigate("CustomerKhata", { customer })}
                theme={theme}
                t={t}
              />
            ))
          )}
        </ScrollView>
      </View>

      <Portal>
        <Dialog visible={showForm} onDismiss={() => setShowForm(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>
            {t("ledger.customer.add_title", "Add New Account")}
          </Dialog.Title>
          <Dialog.Content>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label={t("ledger.customer.name", "Customer Name")}
                value={formData.name}
                onChangeText={(t) => setFormData({ ...formData, name: t })}
                icon="user"
              />
              <Input
                label={t("ledger.customer.phone", "Mobile Number")}
                value={formData.phone}
                onChangeText={(t) => setFormData({ ...formData, phone: t })}
                keyboardType="phone-pad"
                icon="phone"
              />
              <Input
                label={t("ledger.customer.address", "Business Address")}
                value={formData.address}
                onChangeText={(t) => setFormData({ ...formData, address: t })}
                icon="map-pin"
              />
              <Input
                label={t("ledger.customer.gst_number", "GSTIN")}
                value={formData.gstNumber}
                onChangeText={(t) => setFormData({ ...formData, gstNumber: t })}
                icon="file-text"
              />
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button mode="text" onPress={() => setShowForm(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onPress={handleSave} loading={isSaving} style={{ flex: 1 }}>
              {t("ledger.buttons.create_account", "Create Account")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

function CustomerAccountCard({
  customer,
  onPress,
  theme,
  t,
}: {
  customer: Customer;
  onPress: () => void;
  theme: MD3Theme;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const balance = Number(customer.totalBalance ?? 0);
  const isDue = balance > 0;
  const tone = isDue ? "#ef4444" : balance < 0 ? "#10b981" : "#94a3b8";

  return (
    <TouchableOpacity style={styles.accountCard} onPress={onPress} activeOpacity={0.7}>
      <Avatar.Text
        size={48}
        label={customer.name.slice(0, 1).toUpperCase()}
        style={{ backgroundColor: "#f1f5f9" }}
        labelStyle={{ color: theme.colors.primary, fontWeight: "900" }}
      />
      <View style={styles.accountInfo}>
        <Text variant="titleMedium" style={styles.accountName}>
          {customer.name}
        </Text>
        <View style={styles.accountMeta}>
          <Phone size={10} color="#94a3b8" />
          <Text variant="labelSmall" style={styles.accountPhone}>
            {customer.phone || t("ledger.customer.no_phone", "No phone")}
          </Text>
        </View>
      </View>
      <View style={styles.accountBalance}>
        <Text variant="titleMedium" style={[styles.balanceText, { color: tone }]}>
          {formatCurrency(Math.abs(balance))}
        </Text>
        <View style={styles.indicatorRow}>
          <Text variant="labelSmall" style={[styles.indicatorText, { color: tone }]}>
            {balance > 0
              ? t("ledger.customer.give", "GIVE")
              : balance < 0
                ? t("ledger.customer.get", "GET")
                : t("ledger.customer.settled", "CLR")}
          </Text>
          <ChevronRight size={12} color="#cbd5e1" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  hero: {
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    ...Platform.select({
      web: {
        boxShadow: "0 10px 20px rgba(67, 56, 202, 0.3)",
      },
      default: {
        elevation: 10,
        shadowColor: "#4338ca",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
    }),
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  heroSub: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "900",
    letterSpacing: 2,
  },
  heroBalance: {
    color: "white",
    fontWeight: "900",
    marginTop: 4,
  },
  netBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
  },
  netBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  addHeroBtn: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    paddingHorizontal: 24,
  },
  heroStatItem: {
    flex: 1,
  },
  heroStatLabel: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "900",
    fontSize: 9,
    letterSpacing: 1,
  },
  heroStatValue: {
    color: "white",
    fontWeight: "900",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 20,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  searchSection: {
    paddingHorizontal: 16,
    zIndex: 10,
  },
  searchBar: {
    borderRadius: 20,
    backgroundColor: "white",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      },
      default: {
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },
  searchInput: {
    fontSize: 15,
  },
  filterRow: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: "#f8fafc",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    backgroundColor: "white",
    borderRadius: 28,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  accountInfo: {
    flex: 1,
    marginLeft: 16,
  },
  accountName: {
    fontWeight: "900",
    color: "#1e293b",
  },
  accountMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  accountPhone: {
    color: "#94a3b8",
    fontWeight: "800",
  },
  accountBalance: {
    alignItems: "flex-end",
  },
  balanceText: {
    fontWeight: "900",
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  indicatorText: {
    fontWeight: "900",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  empty: {
    paddingVertical: 100,
    alignItems: "center",
  },
  emptyText: {
    color: "#94a3b8",
    marginTop: 16,
    fontWeight: "800",
  },
  dialog: {
    borderRadius: 32,
  },
  dialogTitle: {
    textAlign: "center",
    fontWeight: "900",
  },
  dialogActions: {
    padding: 24,
    gap: 12,
  },
});
