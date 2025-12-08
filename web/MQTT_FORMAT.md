# Formato MQTT Simplificado

## 📡 Estrutura do Payload

O ESP32 envia dados no formato JSON simplificado via MQTT:

```json
{
  "device_id": "A1B2C3D4E5F6",
  "label": "normal" | "anomalous",
  "score": 0.0 - 1.0
}
```

### Campos

| Campo | Tipo | Valores | Descrição |
|-------|------|---------|-----------|
| `device_id` | string | MAC Address sem ':' | Identificador único do dispositivo ESP32 |
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
  "device_id": "A1B2C3D4E5F6",
  "label": "normal",
  "score": 0.95
}
```

### Anomalia - Warning
```json
{
  "device_id": "A1B2C3D4E5F6",
  "label": "anomalous",
  "score": 0.65
}
```

### Anomalia - Critical
```json
{
  "device_id": "A1B2C3D4E5F6",
  "label": "anomalous",
  "score": 0.92
}
```

### Anomalia - Baixa Confiança
```json
{
  "device_id": "A1B2C3D4E5F6",
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
mosquitto_pub -h localhost -p 1883 -t machines/anomalies \
  -m '{"device_id": "TEST001", "label": "normal", "score": 0.95}'

# Anomalia crítica
mosquitto_pub -h localhost -p 1883 -t machines/anomalies \
  -m '{"device_id": "TEST001", "label": "anomalous", "score": 0.92}'
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
// Exemplo código para ESP32
// Gerar ID único baseado no MAC Address
String deviceID = WiFi.macAddress();
deviceID.replace(":", ""); // Remove ':' do MAC

String payload = 
  "{\"device_id\": \"" + deviceID + 
  "\", \"label\": \"" + prediction_label + 
  "\", \"score\": " + String(confidence_score, 3) + "}";

mqttClient.publish("machines/anomalies", payload.c_str());
```

Onde:
- `deviceID`: MAC Address do ESP32 sem ':' (ex: A1B2C3D4E5F6)
- `prediction_label`: "normal" ou "anomalous" (resultado do modelo)
- `confidence_score`: valor float entre 0 e 1 (confiança da predição)

## 📱 Gerenciamento de Dispositivos

O dashboard inclui um módulo de gerenciamento que permite:

1. **Cadastrar Dispositivos**: Adicione dispositivos com nome personalizado e localização
2. **Editar Informações**: Atualize nome, descrição e coordenadas GPS
3. **Visualização no Mapa**: Dispositivos aparecem nas coordenadas cadastradas
4. **Persistência Local**: Dados salvos no navegador (localStorage)

### Como Cadastrar um Dispositivo

1. Clique no botão "Dispositivos" no canto superior direito
2. Clique em "Adicionar Novo Dispositivo"
3. Preencha os campos:
   - **ID do Dispositivo**: MAC Address do ESP32 (sem ':')
   - **Nome**: Nome amigável (ex: "Máquina de Corte 01")
   - **Descrição**: Informações adicionais (opcional)
   - **Latitude/Longitude**: Coordenadas GPS da máquina
4. Clique em "Adicionar"

### Obtendo o MAC Address do ESP32

No código do ESP32, adicione ao `setup()`:

```cpp
void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  String mac = WiFi.macAddress();
  String deviceID = mac;
  deviceID.replace(":", "");
  
  Serial.println("MAC Address: " + mac);
  Serial.println("Device ID: " + deviceID);
}
```
