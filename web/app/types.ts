export interface Location {
  lat: number;
  lng: number;
}

export interface Sensors {
  vibration: number;
  temperature: number;
  current: number;
}

// Formato simplificado recebido do ESP32
export interface MQTTPayload {
  device_id: string;               // ID único do dispositivo
  label: "normal" | "anomalous";  // Status da máquina
  score: number;                   // Confiança da predição (0-1)
}

// Interface para gerenciamento de dispositivos
export interface Device {
  id: string;
  name: string;
  location: Location;
  description?: string;
  addedAt: string;
}

export interface Anomaly {
  detected: boolean;
  score: number;
  severity: "low" | "medium" | "high";
  type: string;
}

export interface MachineData {
  device_id: string;
  timestamp: string;
  location: Location;
  sensors: Sensors;
  anomaly: Anomaly;
  // Dados originais do MQTT
  mqttData?: MQTTPayload;
}

export interface MachineStatus {
  id: string;
  name: string;
  status: "normal" | "warning" | "critical";
  lastUpdate: string;
  data: MachineData;
}
