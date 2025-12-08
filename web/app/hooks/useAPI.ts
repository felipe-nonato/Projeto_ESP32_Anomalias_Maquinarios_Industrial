'use client';

import { useEffect, useState } from 'react';
import { MachineData, MachineStatus } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface APIReading {
  id: number;
  device_id: string;
  label: string;
  score: number;
  status: 'normal' | 'warning' | 'critical';
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface APIStats {
  total: number;
  normal: number;
  warning: number;
  critical: number;
  avg_score: number;
  last_update: string;
}

export function useAPI() {
  const [machines, setMachines] = useState<MachineStatus[]>([]);
  const [stats, setStats] = useState<APIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados iniciais
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Atualizar a cada 5 segundos
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Buscar últimas leituras
      const readingsResponse = await fetch(`${API_URL}/api/readings?limit=10`);
      const readingsData = await readingsResponse.json();

      // Buscar estatísticas
      const statsResponse = await fetch(`${API_URL}/api/stats`);
      const statsData = await statsResponse.json();

      if (readingsData.success) {
        const machineStatuses = readingsData.data.map((reading: APIReading) => 
          convertToMachineStatus(reading)
        );
        setMachines(machineStatuses);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }

      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching data from API:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  const convertToMachineStatus = (reading: APIReading): MachineStatus => {
    const data: MachineData = {
      device_id: reading.device_id,
      timestamp: reading.timestamp,
      location: { lat: -23.5505, lng: -46.6333 }, // Default location
      sensors: {
        vibration: 0,
        temperature: 0,
        current: 0
      },
      anomaly: {
        detected: reading.label === 'anomalous',
        score: reading.score,
        severity: reading.severity,
        type: reading.label === 'anomalous' ? 'anomaly' : 'none'
      },
      mqttData: {
        label: reading.label as 'normal' | 'anomalous',
        score: reading.score
      }
    };

    return {
      id: reading.device_id,
      name: `${reading.device_id}`,
      status: reading.status,
      lastUpdate: reading.timestamp,
      data
    };
  };

  return {
    machines,
    stats,
    loading,
    error,
    refetch: fetchData
  };
}
