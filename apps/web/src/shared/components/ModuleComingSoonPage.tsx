import { appModules } from "@/modules/moduleRegistry";
import { Button } from "@hisabkit/ui/components/Button";
import { motion } from "framer-motion";
import { ArrowLeft, Rocket, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const ModuleComingSoonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const module = useMemo(() => {
    return appModules.find((m) => m.route === location.pathname);
  }, [location.pathname]);

  const moduleLabel = module?.label || "Module";
  const Icon = module?.icon || Rocket;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 text-center overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-20 dark:opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-transparent to-violet-500/30 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 relative z-10">
          <Icon className="w-12 h-12" />
        </div>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 4,
            ease: "easeInOut"
          }}
          className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 z-20"
        >
          <Sparkles className="w-5 h-5" />
        </motion.div>
        <div className="absolute -inset-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -z-0" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-xl"
      >
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 mb-4">
          On Our Roadmap
        </span>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          {moduleLabel} <span className="text-indigo-600 dark:text-indigo-400">is Coming Soon</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed mb-10">
          We're engineering a specialized workflow for {moduleLabel} to empower MSMEs like yours. 
          This feature will be available in a future update of HisabKit.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            className="rounded-2xl h-12 px-8 font-bold gap-2 bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl h-12 px-8 font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </motion.div>
      
      {/* Decorative dots background for premium feel */}
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-30 dark:opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-indigo-400" />
        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 rounded-full bg-violet-400" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-sky-400" />
      </div>
    </div>
  );
};
