'use client';

import { MachineStatus } from '../types';
import { AlertCircle, Activity, Thermometer, Zap } from 'lucide-react';

interface MachineCardProps {
  machine: MachineStatus;
}

export default function MachineCard({ machine }: MachineCardProps) {
  const statusColor = 
    machine.status === 'critical' ? 'bg-red-100 border-red-500 text-red-900' :
    machine.status === 'warning' ? 'bg-yellow-100 border-yellow-500 text-yellow-900' :
    'bg-green-100 border-green-500 text-green-900';

  const statusIcon = 
    machine.status === 'critical' || machine.status === 'warning' ? 
    <AlertCircle className="w-5 h-5" /> :
    <Activity className="w-5 h-5" />;

  return (
    <div className={`border-l-4 rounded-lg p-4 shadow-md ${statusColor} bg-opacity-50`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {statusIcon}
          <h3 className="font-semibold text-lg">{machine.name}</h3>
        </div>
        <span className="text-xs opacity-75">
          {new Date(machine.data.timestamp).toLocaleTimeString('pt-BR')}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-3">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4" />
          <div>
            <p className="text-xs opacity-75">Temperatura</p>
            <p className="font-semibold">{machine.data.sensors.temperature.toFixed(1)}°C</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          <div>
            <p className="text-xs opacity-75">Vibração</p>
            <p className="font-semibold">{machine.data.sensors.vibration.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <div>
            <p className="text-xs opacity-75">Corrente</p>
            <p className="font-semibold">{machine.data.sensors.current.toFixed(1)}A</p>
          </div>
        </div>
      </div>

      {machine.data.anomaly.detected && (
        <div className="mt-3 p-2 bg-red-500 bg-opacity-20 rounded border border-red-500">
          <p className="text-sm font-semibold">
            🚨 Anomalia Detectada: {machine.data.anomaly.type}
          </p>
          <p className="text-xs mt-1">
            Confiança: {(machine.data.anomaly.score * 100).toFixed(0)}% | 
            Severidade: {machine.data.anomaly.severity}
          </p>
        </div>
      )}
    </div>
  );
}
