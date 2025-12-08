#!/bin/bash

# Script melhorado para monitorar dados do ESP32 em tempo real

echo "=========================================="
echo "📡 Monitor MQTT - ESP32 Anomalias"
echo "=========================================="
echo "Tópico: /machine/audio/inference"
echo "Pressione Ctrl+C para parar"
echo "=========================================="
echo ""

# Monitorar o tópico específico com formatação
sudo docker exec mqtt-broker mosquitto_sub \
  -h localhost \
  -t "/machine/audio/inference" \
  -v | while read -r line; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $line"
  done
