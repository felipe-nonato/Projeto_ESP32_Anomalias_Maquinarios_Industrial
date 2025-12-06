'use client';

import { useEffect, useRef, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { MachineData, MachineStatus, MQTTPayload } from '../types';

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
        const mqttPayload: MQTTPayload = JSON.parse(message.toString());
        console.log('Dados recebidos do MQTT:', mqttPayload);

        // Determinar status e severidade baseado no label e score
        const isAnomalous = mqttPayload.label === 'anomalous';
        const score = mqttPayload.score;
        
        let status: 'normal' | 'warning' | 'critical' = 'normal';
        let severity: 'low' | 'medium' | 'high' = 'low';
        
        if (isAnomalous) {
          // Score alto (>0.8) = crítico, médio (0.5-0.8) = aviso, baixo (<0.5) = normal
          if (score > 0.8) {
            status = 'critical';
            severity = 'high';
          } else if (score > 0.5) {
            status = 'warning';
            severity = 'medium';
          } else {
            status = 'normal';
            severity = 'low';
          }
        }

        // Criar dados estruturados a partir do payload MQTT
        const data: MachineData = {
          device_id: `machine-${Date.now()}`, // ID único baseado em timestamp
          timestamp: new Date().toISOString(),
          location: { lat: -23.5505, lng: -46.6333 }, // Localização padrão (São Paulo)
          sensors: {
            vibration: 0,
            temperature: 0,
            current: 0
          },
          anomaly: {
            detected: isAnomalous,
            score: score,
            severity: severity,
            type: isAnomalous ? 'anomaly' : 'none'
          },
          mqttData: mqttPayload
        };

        const machineStatus: MachineStatus = {
          id: data.device_id,
          name: `Máquina ${isAnomalous ? 'ANORMAL' : 'Normal'}`,
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
