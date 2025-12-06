#!/bin/bash

# Script para testar o dashboard enviando dados MQTT simulados
# Formato simplificado: label (normal/anomalous) e score (0-1)
# Requer mosquitto_pub instalado

BROKER="localhost"
PORT="1883"
TOPIC="machines/anomalies"

echo "📡 Enviando dados simulados para MQTT..."
echo "Broker: $BROKER:$PORT"
echo "Tópico: $TOPIC"
echo "Formato: {label: normal|anomalous, score: 0-1}"
echo ""

# Teste 1 - Normal (baixa confiança)
echo "✅ Enviando: Normal - Score 0.15..."
mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC" -m '{
  "label": "normal",
  "score": 0.15
}'

sleep 2

# Teste 2 - Normal (alta confiança)
echo "✅ Enviando: Normal - Score 0.95..."
mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC" -m '{
  "label": "normal",
  "score": 0.95
}'

sleep 2

# Teste 3 - Anômalo (média confiança - warning)
echo "⚠️  Enviando: Anômalo - Score 0.65 (Warning)..."
mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC" -m '{
  "label": "anomalous",
  "score": 0.65
}'

sleep 2

# Teste 4 - Anômalo (alta confiança - critical)
echo "🚨 Enviando: Anômalo - Score 0.92 (Critical)..."
mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC" -m '{
  "label": "anomalous",
  "score": 0.92
}'

sleep 2

# Teste 5 - Anômalo (baixa confiança)
echo "⚠️  Enviando: Anômalo - Score 0.45..."
mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC" -m '{
  "label": "anomalous",
  "score": 0.45
}'

echo ""
echo "✨ Dados enviados com sucesso!"
echo "Legenda:"
echo "  • Normal: label='normal'"
echo "  • Anômalo: label='anomalous'"
echo "  • Score > 0.8: Critical (vermelho)"
echo "  • Score 0.5-0.8: Warning (amarelo)"
echo "  • Score < 0.5: Normal (verde)"
echo ""
echo "Acesse http://localhost:3000 para ver o dashboard"
