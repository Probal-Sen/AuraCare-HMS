import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, subtext }) => {
  const colorMap = {
    blue: 'from-blue-500/10 to-medical-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500',
    emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500',
    purple: 'from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500',
    rose: 'from-rose-500/10 to-red-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-500',
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="p-5 rounded-2xl glass-panel shadow-sm border relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</h3>
          {trend && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <span>↑ {trend}</span>
              {subtext && <span className="text-slate-400 text-[11px] font-normal">{subtext}</span>}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentTheme.split(' ')[0]} ${currentTheme.split(' ')[1]} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${currentTheme.split(' ')[3]}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
