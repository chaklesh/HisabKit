import { useAuth } from "@/shared/context/AuthContext";
import { DashboardActionsPanel } from "../components/DashboardActionsPanel";
import { DashboardAnalyticsSection } from "../components/DashboardAnalyticsSection";
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardSummaryCards } from "../components/DashboardSummaryCards";
import { useDashboardHomeState } from "../hooks/useDashboardHomeState";

export const DashboardHomePage = () => {
  const { user } = useAuth();
  const { customers, summary, topDebtors, topCreditors } = useDashboardHomeState();

  return (
    <div className="max-w-[1400px] mx-auto py-4 px-4 lg:px-8 space-y-10">
      <DashboardHeader user={user} />
      <DashboardSummaryCards customerCount={customers.length} summary={summary} />
      <DashboardAnalyticsSection
        summary={summary}
        topDebtors={topDebtors}
        topCreditors={topCreditors}
      />
      <DashboardActionsPanel user={user} />
    </div>
  );
};
