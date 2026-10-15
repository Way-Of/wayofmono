// .gemini/skills/opticat-ui-builder/assets/ui-templates/dashboard-card.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, className }) => {
  return (
    <div className={`bg-[#252526] p-4 rounded border border-[#3c3c3c] flex items-center justify-between ${className}`}>
      <div>
        <p className="text-sm text-[#858585]">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      {Icon && <Icon size={32} className="text-[#ea580c]" />}
    </div>
  );
};
