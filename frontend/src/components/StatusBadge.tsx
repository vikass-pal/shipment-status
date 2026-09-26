import React from 'react';
import { ShipmentStatus } from '../types/shipment';
import {
  Package,
  Truck,
  AlertTriangle,
  Navigation,
  CheckCircle2,
} from 'lucide-react';

interface StatusBadgeProps {
  status: ShipmentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const STATUS_CONFIG: Record<
  ShipmentStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    icon: React.ElementType;
  }
> = {
  BOOKED: {
    label: 'Booked',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    icon: Package,
  },
  IN_TRANSIT: {
    label: 'In Transit',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Truck,
  },
  CUSTOMS_HOLD: {
    label: 'Customs Hold',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    icon: AlertTriangle,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out For Delivery',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    icon: Navigation,
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.BOOKED;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-bold gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} shadow-xs transition-all duration-200`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} shrink-0`} />}
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
};
