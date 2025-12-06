'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MachineStatus } from '../types';

interface MapComponentProps {
  machines: MachineStatus[];
  onMachineClick?: (machine: MachineStatus) => void;
}

export default function MapComponent({ machines, onMachineClick }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inicializar o mapa apenas uma vez
    if (!mapRef.current) {
      const map = L.map('map').setView([-23.55052, -46.633308], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapRef.current = map;
    }

    // Atualizar marcadores
    const map = mapRef.current;
    const currentMarkerIds = new Set<string>();

    machines.forEach((machine) => {
      currentMarkerIds.add(machine.id);
      
      const color = 
        machine.status === 'critical' ? '#ef4444' :
        machine.status === 'warning' ? '#f59e0b' :
        '#22c55e';

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (markersRef.current[machine.id]) {
        // Atualizar marcador existente
        const marker = markersRef.current[machine.id];
        marker.setLatLng([machine.data.location.lat, machine.data.location.lng]);
        marker.setIcon(icon);
      } else {
        // Criar novo marcador
        const marker = L.marker(
          [machine.data.location.lat, machine.data.location.lng],
          { icon }
        ).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600;">${machine.name}</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> ${machine.status}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Temperatura:</strong> ${machine.data.sensors.temperature.toFixed(1)}°C</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Vibração:</strong> ${machine.data.sensors.vibration.toFixed(2)}</p>
            ${machine.data.anomaly.detected ? 
              `<p style="margin: 4px 0; font-size: 14px; color: #ef4444;"><strong>Anomalia:</strong> ${machine.data.anomaly.type} (${(machine.data.anomaly.score * 100).toFixed(0)}%)</p>` 
              : ''}
          </div>
        `);

        if (onMachineClick) {
          marker.on('click', () => onMachineClick(machine));
        }

        markersRef.current[machine.id] = marker;
      }
    });

    // Remover marcadores de máquinas que não existem mais
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentMarkerIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    return () => {
      // Cleanup ao desmontar
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [machines, onMachineClick]);

  return (
    <div id="map" className="w-full h-full rounded-lg" style={{ minHeight: '400px' }} />
  );
}
