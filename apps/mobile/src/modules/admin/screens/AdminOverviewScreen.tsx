import type { LedgerTransaction, Tenant } from "@hisabkit/types";
import { Building2, Database, History, ShieldCheck } from "lucide-react-native";
import type React from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { Screen } from "../../../shared/components/ui/Screen";
import { formatCurrency, formatDate } from "../../../utils/format";
import adminService from "../services/adminService";

type AdminListItem =
  | { itemType: "STATS" }
  | { itemType: "TENANTS_HEADER" }
  | { itemType: "HISTORY_HEADER" }
  | (Tenant & { itemType: "TENANT" })
  | (LedgerTransaction & { itemType: "TRANSACTION" });

export function AdminOverviewScreen() {
  const theme = useTheme();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [globalHistory, setGlobalHistory] = useState<LedgerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [tenantsRes, historyRes] = await Promise.all([
          adminService.listTenants(),
          adminService.listGlobalHistory(),
        ]);
        setTenants(Array.isArray(tenantsRes) ? tenantsRes : []);
        setGlobalHistory(Array.isArray(historyRes) ? historyRes : []);
      } catch (err) {
        setError("Failed to load admin data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Screen>
    );
  }

  const listData: AdminListItem[] = [
    { itemType: "STATS" },
    { itemType: "TENANTS_HEADER" },
    ...tenants.map((t) => ({ ...t, itemType: "TENANT" as const })),
    { itemType: "HISTORY_HEADER" },
    ...globalHistory.map((h) => ({ ...h, itemType: "TRANSACTION" as const })),
  ];

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <ShieldCheck size={28} color={theme.colors.primary} />
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Admin Console
        </Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(_item, index) => index.toString()}
        renderItem={({ item }) => {
          if (item.itemType === "STATS") {
            return (
              <View style={styles.statsRow}>
                <StatCard
                  icon={<Building2 size={20} color="#fff" />}
                  label="Shops"
                  value={tenants.length.toString()}
                  color="#6366f1"
                />
                <StatCard
                  icon={<Database size={20} color="#fff" />}
                  label="Logs"
                  value={globalHistory.length.toString()}
                  color="#10b981"
                />
              </View>
            );
          }
          if (item.itemType === "TENANTS_HEADER") {
            return <SectionTitle title="Registered Shops" />;
          }
          if (item.itemType === "HISTORY_HEADER") {
            return <SectionTitle title="Recent System Logs" />;
          }

          if (item.itemType === "TENANT") {
            // Tenant Item
            return (
              <Card style={styles.itemCard}>
                <Card.Content style={styles.itemContent}>
                  <View style={styles.itemLeft}>
                    <View style={styles.iconBox}>
                      <Building2 size={20} color="#64748b" />
                    </View>
                    <View>
                      <Text variant="titleMedium" style={styles.bold}>
                        {item.name}
                      </Text>
                      <Text variant="bodySmall" style={styles.dim}>
                        {item.ownerName || "No Owner"}
                      </Text>
                    </View>
                  </View>
                  <Text variant="labelSmall" style={styles.statusBadge}>
                    {item.status || "ACTIVE"}
                  </Text>
                </Card.Content>
              </Card>
            );
          }

          if (item.itemType === "TRANSACTION") {
            // Transaction Item
            return (
              <View style={styles.logRow}>
                <View style={styles.logLeft}>
                  <History size={16} color="#94a3b8" />
                  <Text variant="bodySmall" style={styles.logText}>
                    <Text style={styles.bold}>{item.type}</Text> of{" "}
                    {formatCurrency(item.totalAmount)}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.dim}>
                  {formatDate(item.timestamp)}
                </Text>
              </View>
            );
          }

          return null;
        }}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) => (
  <Card style={[styles.statCard, { backgroundColor: color }]}>
    <Card.Content style={styles.statContent}>
      {icon}
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Card.Content>
  </Card>
);

const SectionTitle = ({ title }: { title: string }) => (
  <Text variant="titleSmall" style={styles.sectionTitle}>
    {title}
  </Text>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  headerTitle: {
    fontWeight: "900",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  statValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontWeight: "900",
    color: "#475569",
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  list: {
    paddingBottom: 40,
  },
  itemCard: {
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  bold: {
    fontWeight: "900",
  },
  dim: {
    color: "#64748b",
  },
  statusBadge: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: "900",
    fontSize: 8,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  logLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logText: {
    color: "#1e293b",
  },
});
