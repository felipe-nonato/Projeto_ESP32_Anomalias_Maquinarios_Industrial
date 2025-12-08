#!/bin/bash

# Script para monitorar mensagens MQTT do ESP32
# Uso: ./monitor-mqtt.sh [tópico]

TOPIC="${1:-#}"

echo "=========================================="
echo "Monitor MQTT - ESP32 Anomalias"
echo "=========================================="
echo "Tópico: $TOPIC"
echo "Pressione Ctrl+C para parar"
echo "=========================================="
echo ""

# Subscrever no tópico e exibir mensagens com timestamp
sudo docker exec mqtt-broker mosquitto_sub -h localhost -t "$TOPIC" -v -F '%I %t %p'
