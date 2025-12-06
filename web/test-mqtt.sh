#!/bin/bash

# Script para testar o dashboard enviando dados MQTT simulados
# Requer mosquitto_pub instalado

BROKER="localhost"
PORT="1883"
TOPIC="machines/anomalies"

echo "📡 Enviando dados simulados para MQTT..."
echo "Broker: $BROKER:$PORT"
echo "Tópico: $TOPIC"
echo ""

# Máquina 1 - Normal
echo "✅ Enviando dados da Máquina 1 (Normal)..."
mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC" -m '{
  "device_id": "maquina-01",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "location": {"lat": -23.55052, "lng": -46.633308},
  "sensors": {"vibration": 0.05, "temperature": 65.2, "current": 2.1},
  "anomaly": {"detected": false, "score": 0.15, "severity": "low", "type": "none"}
}'

sleep 1

# Máquina 2 - Warning
echo "⚠️  Enviando dados da Máquina 2 (Warning)..."
mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC" -m '{
  "device_id": "maquina-02",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "location": {"lat": -23.55152, "lng": -46.634308},
  "sensors": {"vibration": 0.18, "temperature": 72.5, "current": 2.5},
  "anomaly": {"detected": true, "score": 0.65, "severity": "medium", "type": "vibration"}
}'

sleep 1

# Máquina 3 - Critical
echo "🚨 Enviando dados da Máquina 3 (Critical)..."
mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC" -m '{
  "device_id": "maquina-03",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "location": {"lat": -23.54952, "lng": -46.632308},
  "sensors": {"vibration": 0.35, "temperature": 85.8, "current": 3.2},
  "anomaly": {"detected": true, "score": 0.92, "severity": "high", "type": "bearing"}
}'

sleep 1

# Máquina 4 - Normal
echo "✅ Enviando dados da Máquina 4 (Normal)..."
mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC" -m '{
  "device_id": "maquina-04",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "location": {"lat": -23.55252, "lng": -46.631308},
  "sensors": {"vibration": 0.08, "temperature": 67.1, "current": 2.0},
  "anomaly": {"detected": false, "score": 0.22, "severity": "low", "type": "none"}
}'

echo ""
echo "✨ Dados enviados com sucesso!"
echo "Acesse http://localhost:3000 para ver o dashboard"
