'use client';

import { MachineStatus, MQTTPayload } from '../types';
import { AlertCircle, Activity, Thermometer, Zap } from 'lucide-react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface MachineCardProps {
  machine: MachineStatus;
}

export default function MachineCard({ machine }: MachineCardProps): JSX.Element {
  const statusColor: string = 
    machine.status === 'critical' ? 'bg-red-100 border-red-500 text-red-900 dark:bg-red-900 dark:text-red-100' :
    machine.status === 'warning' ? 'bg-yellow-100 border-yellow-500 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' :
    'bg-green-100 border-green-500 text-green-900 dark:bg-green-900 dark:text-green-100';

  const statusIcon: JSX.Element = 
    machine.status === 'critical' || machine.status === 'warning' ? 
    <AlertCircle className="w-5 h-5" /> :
    <Activity className="w-5 h-5" />;

  const mqttData: MQTTPayload | undefined = machine.data.mqttData;

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
      
      {/* Dados principais do MQTT */}
      {mqttData && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg">
            <div>
              <p className="text-xs opacity-75">Status</p>
              <p className="font-bold text-lg flex items-center gap-2">
                {mqttData.label === 'normal' ? (
                  <><FaCheckCircle className="text-green-600" /> Normal</>
                ) : (
                  <><FaExclamationCircle className="text-red-600" /> Anômalo</>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-75">Confiança</p>
              <p className="font-bold text-lg">
                {(mqttData.score * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          
          {/* Barra de confiança visual */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                mqttData.label === 'anomalous' ? 'bg-red-600' : 'bg-green-600'
              }`}
              style={{ width: `${mqttData.score * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {machine.data.anomaly.detected && (
        <div className="mt-3 p-2 bg-red-500 bg-opacity-20 rounded border border-red-500">
          <p className="text-sm font-semibold flex items-center gap-2">
            <FaExclamationCircle /> Anomalia Detectada
          </p>
          <p className="text-xs mt-1">
            Severidade: {machine.data.anomaly.severity.toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
}
