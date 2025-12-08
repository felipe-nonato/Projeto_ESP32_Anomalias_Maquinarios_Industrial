#!/bin/bash

# Script para iniciar todo o sistema de uma vez

echo "🚀 Iniciando Sistema de Monitoramento ESP32"
echo "==========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -d "server" ]; then
    echo "❌ Execute este script do diretório 'web'"
    exit 1
fi

# 1. Iniciar MQTT Broker
echo "1️⃣  Iniciando MQTT Broker..."
sudo docker compose up -d
sleep 3

# Verificar se está rodando
if sudo docker ps | grep -q mqtt-broker; then
    echo "   ✅ MQTT Broker rodando"
else
    echo "   ❌ Erro ao iniciar MQTT Broker"
    exit 1
fi

# 2. Iniciar Servidor Express
echo ""
echo "2️⃣  Iniciando Servidor Express..."
cd server
if [ ! -d "node_modules" ]; then
    echo "   📦 Instalando dependências..."
    npm install --silent
fi

# Matar processo anterior se existir
pkill -f "node index.js" 2>/dev/null

# Iniciar servidor em background
nohup node index.js > server.log 2>&1 &
SERVER_PID=$!
echo "   🔄 Aguardando servidor iniciar..."
sleep 5

# Verificar se está rodando
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "   ✅ Servidor Express rodando (PID: $SERVER_PID)"
else
    echo "   ❌ Erro ao iniciar Servidor Express"
    cat server.log
    exit 1
fi

cd ..

echo ""
echo "==========================================="
echo "✅ Sistema iniciado com sucesso!"
echo "==========================================="
echo ""
echo "📡 Serviços rodando:"
echo "   • MQTT Broker: mqtt://localhost:1883"
echo "   • WebSocket: ws://localhost:9001"
echo "   • API Server: http://localhost:3001"
echo ""
echo "🌐 Próximo passo:"
echo "   1. Iniciar o frontend:"
echo "      npm run dev"
echo ""
echo "   2. Acessar o dashboard:"
echo "      http://localhost:3000"
echo ""
echo "📊 Comandos úteis:"
echo "   • Monitorar MQTT: ./monitor-esp32.sh"
echo "   • Testar sistema: ./test-mqtt.sh"
echo "   • Ver logs API: tail -f server/server.log"
echo "   • Parar tudo: ./stop-system.sh"
echo ""
echo "==========================================="
