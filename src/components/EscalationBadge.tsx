import React from 'react';
import { EscalationLevel } from '../types/index.ts';
import { Shield, ArrowUpRight, AlertOctagon, Building2 } from 'lucide-react';
import { getEscalationLabel } from '../utils/escalation.ts';

interface EscalationBadgeProps {
  level: EscalationLevel;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  department?: string;
  className?: string;
}

export const EscalationBadge: React.FC<EscalationBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  department,
  className = '',
}) => {
  const label = getEscalationLabel(level);

  // Badge text strictly follows requirement: 'Escalated to ...'
  const badgeText = `Escalated to ${label}`;

  let colorClasses = '';
  let IconComponent = Shield;

  switch (level) {
    case 1:
      // Level 1: HOD (Dark forest base with emerald accent)
      colorClasses = 'bg-[#064E3B]/80 text-[#10B981] border-[#10B981]/40 shadow-black/30';
      IconComponent = Building2;
      break;
    case 2:
      // Level 2: Dean (Deep forest with high-contrast off-white text and sharp emerald border)
      colorClasses = 'bg-[#064E3B] text-[#F9FAFB] border-[#10B981] shadow-black/40';
      IconComponent = ArrowUpRight;
      break;
    case 3:
      // Level 3: Higher Authority (Full vibrant emerald with dark charcoal bold text for peak priority)
      colorClasses = 'bg-[#10B981] text-[#111827] font-extrabold border-[#10B981] shadow-black/50';
      IconComponent = AlertOctagon;
      break;
  }

  let sizeClasses = '';
  let iconSize = 'w-3 h-3';

  switch (size) {
    case 'xs':
      sizeClasses = 'text-[10px] px-1.5 py-0.2 rounded font-medium';
      iconSize = 'w-2.5 h-2.5';
      break;
    case 'sm':
      sizeClasses = 'text-[11px] px-2 py-0.5 rounded-md font-semibold';
      iconSize = 'w-3 h-3';
      break;
    case 'md':
      sizeClasses = 'text-xs px-2.5 py-1 rounded-lg font-bold';
      iconSize = 'w-3.5 h-3.5';
      break;
    case 'lg':
      sizeClasses = 'text-sm px-3.5 py-1.5 rounded-xl font-bold tracking-tight';
      iconSize = 'w-4 h-4';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-mono uppercase tracking-wide shadow-sm transition-all ${colorClasses} ${sizeClasses} ${className}`}
      title={`Level ${level}: ${label}${department ? ` (${department})` : ''}`}
    >
      {showIcon && <IconComponent className={`${iconSize} shrink-0`} />}
      <span>{badgeText}</span>
    </span>
  );
};
