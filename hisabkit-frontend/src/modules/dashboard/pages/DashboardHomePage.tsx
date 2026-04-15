import { DashboardActionsPanel } from '../components/DashboardActionsPanel';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardSummaryCards } from '../components/DashboardSummaryCards';
import { useAuth } from '../../../context/AuthContext';
import { useDashboardHomeState } from '../hooks/useDashboardHomeState';

export const DashboardHomePage = () => {
  const { user } = useAuth();
  const { customers, summary } = useDashboardHomeState();

  return (
    <div className="max-w-7xl mx-auto py-4">
      <DashboardHeader user={user} />
      <DashboardSummaryCards customerCount={customers.length} summary={summary} />
      <DashboardActionsPanel user={user} />
    </div>
  );
};
