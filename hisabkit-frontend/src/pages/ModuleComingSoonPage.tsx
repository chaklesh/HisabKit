import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { appModules } from '../modules/moduleRegistry';

export const ModuleComingSoonPage = () => {
  const location = useLocation();

  const moduleLabel = useMemo(() => {
    return appModules.find((module) => module.route === location.pathname)?.label || 'Module';
  }, [location.pathname]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Planned Module</p>
      <h2 className="mt-2 text-2xl font-black text-slate-900">{moduleLabel}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        This module is intentionally scaffolded in routing and architecture but not enabled in navigation yet.
        It will be activated in a future sprint once domain contracts and UX flows are finalized.
      </p>
    </div>
  );
};
