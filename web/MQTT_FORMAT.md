# Formato MQTT Simplificado

## 📡 Estrutura do Payload

O ESP32 envia dados no formato JSON simplificado via MQTT:

```json
{
  "label": "normal" | "anomalous",
  "score": 0.0 - 1.0
}
```

### Campos

| Campo | Tipo | Valores | Descrição |
|-------|------|---------|-----------|
| `label` | string | `"normal"` ou `"anomalous"` | Indica se a máquina está operando normalmente ou apresenta anomalia |
| `score` | number | 0.0 a 1.0 | Confiança da predição do modelo (0 = baixa, 1 = alta) |

## 🎯 Interpretação dos Status

O dashboard interpreta os dados recebidos da seguinte forma:

### Status Normal ✅
- `label: "normal"`
- Qualquer valor de score
- **Cor:** Verde
- **Indicação:** Máquina operando dentro dos parâmetros normais

### Status Warning ⚠️
- `label: "anomalous"`
- `score: 0.5 - 0.8`
- **Cor:** Amarelo
- **Indicação:** Anomalia detectada com confiança média - requer atenção

### Status Critical 🚨
- `label: "anomalous"`
- `score > 0.8`
- **Cor:** Vermelho
- **Indicação:** Anomalia detectada com alta confiança - ação imediata necessária

### Status Normal (anomalia com baixa confiança)
- `label: "anomalous"`
- `score < 0.5`
- **Cor:** Verde
- **Indicação:** Anomalia detectada mas com baixa confiança - pode ser falso positivo

## 📤 Exemplos de Payloads

### Máquina Normal
```json
{
  "label": "normal",
  "score": 0.95
}
```

### Anomalia - Warning
```json
{
  "label": "anomalous",
  "score": 0.65
}
```

### Anomalia - Critical
```json
{
  "label": "anomalous",
  "score": 0.92
}
```

### Anomalia - Baixa Confiança
```json
{
  "label": "anomalous",
  "score": 0.35
}
```

## 🧪 Testando

Use o script `test-mqtt.sh` para enviar dados de teste:

```bash
cd web
./test-mqtt.sh
```

Ou envie manualmente com mosquitto_pub:

```bash
# Normal
mosquitto_pub -h localhost -p 1883 -t /machine/audio/inference \
  -m '{"label": "normal", "score": 0.95}'

# Anomalia crítica
mosquitto_pub -h localhost -p 1883 -t /machine/audio/inference \
  -m '{"label": "anomalous", "score": 0.92}'
```

## 🔧 Configuração

### Broker MQTT
- **Host:** localhost (padrão)
- **Porta:** 1883
- **Tópico:** `machines/anomalies`

### Variáveis de Ambiente
```env
NEXT_PUBLIC_MQTT_BROKER=ws://localhost:9001
NEXT_PUBLIC_MQTT_TOPIC=machines/anomalies
```

## 📊 Visualização no Dashboard

O dashboard exibe:
- **Status da máquina** (Normal/Anômalo)
- **Confiança da predição** (em %)
- **Barra visual** de confiança
- **Indicadores coloridos** por severidade
- **Timestamp** da última atualização
- **Localização no mapa** (padrão: São Paulo)

## 🔄 Integração com ESP32

O ESP32 deve publicar no tópico MQTT configurado após processar os dados dos sensores:

```cpp
// Exemplo pseudocódigo para ESP32
String payload = "{\"label\": \"" + prediction_label + "\", \"score\": " + confidence_score + "}";
mqttClient.publish("machines/anomalies", payload.c_str());
```

Onde:
- `prediction_label`: "normal" ou "anomalous" (resultado do modelo)
- `confidence_score`: valor float entre 0 e 1 (confiança da predição)
