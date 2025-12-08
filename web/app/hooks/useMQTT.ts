'use client';

import { useEffect, useRef, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { MachineData, MachineStatus, MQTTPayload, Device, Location } from '../types';

interface UseMQTTReturn {
  machines: MachineStatus[];
  connected: boolean;
}

export function useMQTT(brokerUrl: string, topic: string): UseMQTTReturn {
  const [machines, setMachines] = useState<MachineStatus[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
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

    client.on('message', (receivedTopic: string, message: Buffer) => {
      try {
        const mqttPayload: MQTTPayload = JSON.parse(message.toString());
        console.log('Dados recebidos do MQTT:', mqttPayload);

        // Validar se device_id está presente
        if (!mqttPayload.device_id) {
          console.error('device_id não encontrado no payload');
          return;
        }

        // Determinar status e severidade baseado no label e score
        const isAnomalous: boolean = mqttPayload.label === 'anomalous';
        const score: number = mqttPayload.score;
        
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

        // Buscar informações do dispositivo do localStorage
        const savedDevices: string | null = localStorage.getItem('devices');
        let deviceName: string = `Dispositivo ${mqttPayload.device_id.substring(0, 8)}`;
        let deviceLocation: Location = { lat: -23.5505, lng: -46.6333 }; // Localização padrão (São Paulo)
        
        if (savedDevices) {
          try {
            const devices: Device[] = JSON.parse(savedDevices);
            const device: Device | undefined = devices.find((d: Device) => d.id === mqttPayload.device_id);
            if (device) {
              deviceName = device.name;
              deviceLocation = device.location;
            }
          } catch (e: unknown) {
            console.error('Erro ao buscar dispositivos salvos:', e);
          }
        }

        // Criar dados estruturados a partir do payload MQTT
        const data: MachineData = {
          device_id: mqttPayload.device_id,
          timestamp: new Date().toISOString(),
          location: deviceLocation,
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
          name: deviceName,
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
