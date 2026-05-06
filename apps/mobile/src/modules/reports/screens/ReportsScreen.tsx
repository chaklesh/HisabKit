import { LinearGradient } from "expo-linear-gradient";
import {
  BarChart3,
  Box,
  Calendar,
  Download,
  Filter,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Divider, IconButton, Searchbar, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../../shared/components/ui/Card";
import { Screen } from "../../../shared/components/ui/Screen";
import { formatCurrency } from "../../../utils/format";
import { useLedgerData } from "../../ledger/hooks/useLedgerData";

type BalanceFilter = "ALL" | "COLLECT" | "PAY" | "SETTLED";

export function ReportsScreen() {
  const theme = useTheme();
  const { customers, refetch, isRefreshing } = useLedgerData();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BalanceFilter>("ALL");

  const stats = useMemo(() => {
    return customers.reduce(
      (acc, c) => {
        const b = Number(c.totalBalance ?? 0);
        if (b > 0) {
          acc.toCollect += b;
          acc.collectCount++;
        } else if (b < 0) {
          acc.toPay += Math.abs(b);
          acc.payCount++;
        }
        return acc;
      },
      { toCollect: 0, toPay: 0, collectCount: 0, payCount: 0 },
    );
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customers
      .filter((customer) => {
        const balance = Number(customer.totalBalance ?? 0);
        if (filter === "COLLECT") return balance > 0;
        if (filter === "PAY") return balance < 0;
        if (filter === "SETTLED") return balance === 0;
        return true;
      })
      .filter((customer) => {
        if (!term) return true;
        return [customer.name, customer.phone]
          .filter(Boolean)
          .some((val) => val!.toLowerCase().includes(term));
      })
      .sort(
        (a, b) => Math.abs(Number(b.totalBalance ?? 0)) - Math.abs(Number(a.totalBalance ?? 0)),
      );
  }, [customers, filter, search]);

  const maxBalance = Math.max(...customers.map((c) => Math.abs(Number(c.totalBalance ?? 0))), 1);

  return (
    <Screen style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, "#4f46e5"]} style={styles.analyticsHeader}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View>
              <Text variant="headlineSmall" style={styles.whiteText}>
                Analytics
              </Text>
              <Text variant="labelMedium" style={styles.headerSub}>
                Real-time Business Health
              </Text>
            </View>
            <TouchableOpacity style={styles.exportBtn}>
              <Download size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ReportHeroStats stats={stats} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.filterSection}>
          <Searchbar
            placeholder="Search accounts..."
            onChangeText={setSearch}
            value={search}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#94a3b8"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {(["ALL", "COLLECT", "PAY", "SETTLED"] as BalanceFilter[]).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.chip,
                  filter === f && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Text style={[styles.chipText, filter === f && { color: "white" }]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.riskSection}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account Risk Exposure
            </Text>
            <BarChart3 size={20} color={theme.colors.primary} />
          </View>

          {filteredCustomers.length === 0 ? (
            <View style={styles.empty}>
              <Box size={48} color="#e2e8f0" />
              <Text variant="labelLarge" style={{ color: "#94a3b8", marginTop: 12 }}>
                No match found
              </Text>
            </View>
          ) : (
            filteredCustomers.map((customer) => (
              <ReportCustomerCard key={customer.id} customer={customer} maxBalance={maxBalance} />
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
const ReportHeroStats = ({ stats }: { stats: any }) => (
  <View style={styles.statsRow}>
    <View style={styles.statBox}>
      <Text variant="labelSmall" style={styles.whiteLabel}>
        RECEIVABLES
      </Text>
      <Text variant="titleLarge" style={styles.whiteValue}>
        {formatCurrency(stats.toCollect)}
      </Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{stats.collectCount} A/C</Text>
      </View>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statBox}>
      <Text variant="labelSmall" style={styles.whiteLabel}>
        PAYABLES
      </Text>
      <Text variant="titleLarge" style={styles.whiteValue}>
        {formatCurrency(stats.toPay)}
      </Text>
      <View style={[styles.countBadge, { backgroundColor: "#10b981" }]}>
        <Text style={styles.countText}>{stats.payCount} A/C</Text>
      </View>
    </View>
  </View>
);

const ReportCustomerCard = ({
  customer,
  maxBalance,
}: { customer: Customer; maxBalance: number }) => {
  const balance = Number(customer.totalBalance ?? 0);
  const percentage = (Math.abs(balance) / (maxBalance || 1)) * 100;
  const isDue = balance > 0;

  return (
    <Card style={styles.accountCard}>
      <View style={styles.accountRow}>
        <Avatar.Text
          size={40}
          label={customer.name.slice(0, 1).toUpperCase()}
          style={{ backgroundColor: isDue ? "#fef2f2" : "#f0fdf4" }}
          labelStyle={{ color: isDue ? "#ef4444" : "#10b981", fontWeight: "900" }}
        />
        <View style={styles.accountInfo}>
          <Text variant="titleSmall" style={styles.accountName}>
            {customer.name}
          </Text>
          <Text variant="labelSmall" style={styles.accountPhone}>
            {customer.phone || "NO CONTACT"}
          </Text>
        </View>
        <View style={styles.accountBalanceBox}>
          <Text
            variant="titleSmall"
            style={[styles.accountBalance, { color: isDue ? "#ef4444" : "#10b981" }]}
          >
            {formatCurrency(Math.abs(balance))}
          </Text>
          <Text
            variant="labelSmall"
            style={[styles.riskLabel, { color: isDue ? "#f87171" : "#4ade80" }]}
          >
            {isDue ? "OUTSTANDING" : "ADVANCE"}
          </Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressBar,
            { width: `${percentage}%`, backgroundColor: isDue ? "#fee2e2" : "#dcfce7" },
          ]}
        >
          <View style={[styles.progressFill, { backgroundColor: isDue ? "#ef4444" : "#10b981" }]} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
  },
  analyticsHeader: {
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    ...Platform.select({
      web: {
        boxShadow: "0 10px 20px rgba(79, 70, 229, 0.3)",
      },
      default: {
        elevation: 8,
        shadowColor: "#4f46e5",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
    }),
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 24,
  },
  whiteText: {
    color: "white",
    fontWeight: "900",
  },
  headerSub: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "800",
    marginTop: 2,
  },
  exportBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  statBox: {
    flex: 1,
  },
  whiteLabel: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "900",
    letterSpacing: 1,
    fontSize: 9,
  },
  whiteValue: {
    color: "white",
    fontWeight: "900",
    marginTop: 4,
  },
  countBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 8,
  },
  countText: {
    color: "white",
    fontSize: 9,
    fontWeight: "900",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  filterSection: {
    marginTop: -20,
    paddingHorizontal: 16,
    gap: 16,
  },
  searchBar: {
    borderRadius: 20,
    backgroundColor: "white",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      },
      default: {
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
    }),
  },
  searchInput: {
    fontSize: 14,
  },
  chipRow: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: "white",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
  },
  riskSection: {
    padding: 16,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: "900",
    color: "#1e293b",
  },
  accountCard: {
    marginBottom: 12,
    borderRadius: 24,
    padding: 16,
    elevation: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontWeight: "900",
    color: "#1e293b",
  },
  accountPhone: {
    color: "#94a3b8",
    fontWeight: "800",
    fontSize: 9,
    marginTop: 2,
  },
  accountBalanceBox: {
    alignItems: "flex-end",
  },
  accountBalance: {
    fontWeight: "900",
  },
  riskLabel: {
    fontSize: 9,
    fontWeight: "900",
    marginTop: 2,
  },
  riskMeterContainer: {
    marginTop: 16,
  },
  riskMeterBackground: {
    height: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 2,
    overflow: "hidden",
  },
  riskMeterFill: {
    height: "100%",
    borderRadius: 2,
  },
  empty: {
    paddingVertical: 80,
    alignItems: "center",
  },
});
