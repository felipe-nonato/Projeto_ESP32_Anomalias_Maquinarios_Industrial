export interface Location {
  lat: number;
  lng: number;
}

export interface Sensors {
  vibration: number;
  temperature: number;
  current: number;
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
}

export interface MachineStatus {
  id: string;
  name: string;
  status: "normal" | "warning" | "critical";
  lastUpdate: string;
  data: MachineData;
}
