'use client';

import { MachineStatus } from '../types';
import { FaIndustry, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaSearch } from 'react-icons/fa';

interface StatsCardsProps {
  machines: MachineStatus[];
}

export default function StatsCards({ machines }: StatsCardsProps) {
  const totalMachines = machines.length;
  const criticalCount = machines.filter(m => m.status === 'critical').length;
  const warningCount = machines.filter(m => m.status === 'warning').length;
  const normalCount = machines.filter(m => m.status === 'normal').length;
  const anomaliesDetected = machines.filter(m => m.data.anomaly.detected).length;

  const stats = [
    {
      label: 'Total de Máquinas',
      value: totalMachines,
      color: 'bg-blue-500',
      icon: <FaIndustry />
    },
    {
      label: 'Status Normal',
      value: normalCount,
      color: 'bg-green-500',
      icon: <FaCheckCircle />
    },
    {
      label: 'Avisos',
      value: warningCount,
      color: 'bg-yellow-500',
      icon: <FaExclamationTriangle />
    },
    {
      label: 'Crítico',
      value: criticalCount,
      color: 'bg-red-500',
      icon: <FaExclamationCircle />
    },
    {
      label: 'Anomalias Detectadas',
      value: anomaliesDetected,
      color: 'bg-purple-500',
      icon: <FaSearch />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 border border-zinc-200 dark:border-zinc-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
