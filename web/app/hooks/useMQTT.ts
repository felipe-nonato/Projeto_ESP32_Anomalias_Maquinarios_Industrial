'use client';

import { useEffect, useRef, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { MachineData, MachineStatus } from '../types';

export function useMQTT(brokerUrl: string, topic: string) {
  const [machines, setMachines] = useState<MachineStatus[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    // Conectar ao broker MQTT
    const client = mqtt.connect(brokerUrl, {
      clean: true,
      reconnectPeriod: 5000,
    });

    client.on('connect', () => {
      console.log('Conectado ao broker MQTT');
      setConnected(true);
      client.subscribe(topic, (err) => {
        if (err) {
          console.error('Erro ao se inscrever no tópico:', err);
        } else {
          console.log(`Inscrito no tópico: ${topic}`);
        }
      });
    });

    client.on('message', (receivedTopic, message) => {
      try {
        const data: MachineData = JSON.parse(message.toString());
        console.log('Dados recebidos:', data);

        // Determinar status baseado na anomalia
        let status: 'normal' | 'warning' | 'critical' = 'normal';
        if (data.anomaly.detected) {
          status = data.anomaly.severity === 'high' ? 'critical' : 
                   data.anomaly.severity === 'medium' ? 'warning' : 'normal';
        }

        const machineStatus: MachineStatus = {
          id: data.device_id,
          name: data.device_id.replace('-', ' ').toUpperCase(),
          status,
          lastUpdate: data.timestamp,
          data,
        };

        setMachines((prev) => {
          const index = prev.findIndex((m) => m.id === data.device_id);
          if (index >= 0) {
            // Atualizar máquina existente
            const updated = [...prev];
            updated[index] = machineStatus;
            return updated;
          } else {
            // Adicionar nova máquina
            return [...prev, machineStatus];
          }
        });
      } catch (error) {
        console.error('Erro ao processar mensagem MQTT:', error);
      }
    });

    client.on('error', (err) => {
      console.error('Erro na conexão MQTT:', err);
      setConnected(false);
    });

    client.on('close', () => {
      console.log('Conexão MQTT fechada');
      setConnected(false);
    });

    clientRef.current = client;

    // Cleanup ao desmontar
    return () => {
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, [brokerUrl, topic]);

  return { machines, connected };
}
