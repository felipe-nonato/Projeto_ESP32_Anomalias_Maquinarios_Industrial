#!/bin/bash

# Script para parar todo o sistema

echo "🛑 Parando Sistema de Monitoramento ESP32"
echo "==========================================="
echo ""

# 1. Parar Servidor Express
echo "1️⃣  Parando Servidor Express..."
pkill -f "node index.js" && echo "   ✅ Servidor parado" || echo "   ℹ️  Servidor não estava rodando"

# 2. Parar MQTT Broker
echo ""
echo "2️⃣  Parando MQTT Broker..."
sudo docker compose down && echo "   ✅ MQTT Broker parado" || echo "   ⚠️  Erro ao parar MQTT"

# 3. Limpar processos pendentes
echo ""
echo "3️⃣  Limpando processos..."
pkill -f "mosquitto_sub" 2>/dev/null
pkill -f "monitor-esp32" 2>/dev/null

echo ""
echo "==========================================="
echo "✅ Sistema parado com sucesso!"
echo "==========================================="
echo ""
echo "Para iniciar novamente:"
echo "   ./start-system.sh"
echo ""
