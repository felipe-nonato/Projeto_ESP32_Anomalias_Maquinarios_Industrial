'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMQTT } from './hooks/useMQTT';
import { useAPI } from './hooks/useAPI';
import StatsCards from './components/StatsCards';
import MachineCard from './components/MachineCard';
<<<<<<< HEAD
import DeviceManager from './components/DeviceManager';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import { FaMap, FaList, FaInfoCircle, FaCog } from 'react-icons/fa';
=======
import { Activity, Wifi, WifiOff, Database } from 'lucide-react';
import { FaMap, FaList, FaInfoCircle } from 'react-icons/fa';
>>>>>>> d989c1bbcb15c33bf043bcb8e8f66161046a0e84

// Importar MapComponent dinamicamente para evitar problemas com SSR
const MapComponent = dynamic(() => import('./components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
});

<<<<<<< HEAD
type TabType = 'map' | 'list';

export default function Home(): JSX.Element {
  // Configurações do MQTT - ajuste conforme seu broker
  const MQTT_BROKER: string = process.env.NEXT_PUBLIC_MQTT_BROKER || 'ws://localhost:9001';
  const MQTT_TOPIC: string = process.env.NEXT_PUBLIC_MQTT_TOPIC || 'machines/anomalies';
  
  const { machines, connected } = useMQTT(MQTT_BROKER, MQTT_TOPIC);
  const [selectedTab, setSelectedTab] = useState<TabType>('map');
  const [isDeviceManagerOpen, setIsDeviceManagerOpen] = useState<boolean>(false);
=======
export default function Home() {
  // Modo de dados: 'mqtt' para tempo real direto, 'api' para dados do servidor com histórico
  const [dataMode, setDataMode] = useState<'mqtt' | 'api'>('api');
  const [selectedTab, setSelectedTab] = useState<'map' | 'list'>('map');
  
  // Configurações do MQTT (modo direto)
  const MQTT_BROKER = process.env.NEXT_PUBLIC_MQTT_BROKER || 'ws://localhost:9001';
  const MQTT_TOPIC = process.env.NEXT_PUBLIC_MQTT_TOPIC || '/machine/audio/inference';
  
  const mqttData = useMQTT(MQTT_BROKER, MQTT_TOPIC);
  const apiData = useAPI();
  
  // Selecionar fonte de dados baseado no modo
  const { machines, connected } = dataMode === 'mqtt' 
    ? { machines: mqttData.machines, connected: mqttData.connected }
    : { machines: apiData.machines, connected: !apiData.error };
>>>>>>> d989c1bbcb15c33bf043bcb8e8f66161046a0e84

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Dashboard de Anomalias Industriais
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Monitoramento em Tempo Real - ESP32 + MQTT
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
<<<<<<< HEAD
              <button
                onClick={() => setIsDeviceManagerOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
                title="Gerenciar Dispositivos"
              >
                <FaCog /> Dispositivos
              </button>
              
=======
              {/* Modo de dados */}
              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setDataMode('mqtt')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    dataMode === 'mqtt'
                      ? 'bg-blue-500 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Wifi className="w-4 h-4 inline mr-1" />
                  MQTT
                </button>
                <button
                  onClick={() => setDataMode('api')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    dataMode === 'api'
                      ? 'bg-blue-500 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Database className="w-4 h-4 inline mr-1" />
                  API
                </button>
              </div>
              
              {/* Status de conexão */}
>>>>>>> d989c1bbcb15c33bf043bcb8e8f66161046a0e84
              {connected ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Wifi className="w-5 h-5" />
                  <span className="text-sm font-medium">Conectado</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <WifiOff className="w-5 h-5" />
                  <span className="text-sm font-medium">Desconectado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="mb-6">
          <StatsCards machines={machines} />
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setSelectedTab('map')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              selectedTab === 'map'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FaMap /> Mapa
          </button>
          <button
            onClick={() => setSelectedTab('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              selectedTab === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FaList /> Lista
          </button>
        </div>

        {/* Content Area */}
        {selectedTab === 'map' ? (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
              Localização das Máquinas
            </h2>
            {machines.length > 0 ? (
              <MapComponent machines={machines} />
            ) : (
              <div className="w-full h-[500px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-zinc-400 animate-pulse" />
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Aguardando dados das máquinas via MQTT...
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                    Broker: {MQTT_BROKER}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    Tópico: {MQTT_TOPIC}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Lista de Máquinas
            </h2>
            {machines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machines.map((machine) => (
                  <MachineCard key={machine.id} machine={machine} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-12 text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 text-zinc-400 animate-pulse" />
                <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                  Nenhuma máquina detectada
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                  Aguardando dados via MQTT...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <FaInfoCircle /> Como usar este dashboard
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Configure as variáveis de ambiente NEXT_PUBLIC_MQTT_BROKER e NEXT_PUBLIC_MQTT_TOPIC</li>
            <li>• Os dados são recebidos em tempo real via MQTT do ESP32</li>
            <li>• Clique nos marcadores do mapa para ver detalhes de cada máquina</li>
            <li>• Alertas são gerados automaticamente quando anomalias são detectadas</li>
          </ul>
        </div>
      </main>

      {/* Device Manager Modal */}
      <DeviceManager 
        isOpen={isDeviceManagerOpen} 
        onClose={() => setIsDeviceManagerOpen(false)} 
      />
    </div>
  );
}
