# Guia de Integração ESP32 ↔ Dashboard

## 📡 Como conectar o ESP32 ao Dashboard

### 1. Código Arduino/ESP32

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Configurações WiFi
const char* ssid = "SEU_WIFI";
const char* password = "SUA_SENHA";

// Configurações MQTT
const char* mqtt_server = "192.168.1.100";  // IP do seu PC
const int mqtt_port = 1883;
const char* mqtt_topic = "machines/anomalies";

WiFiClient espClient;
PubSubClient client(espClient);

// Dados da máquina
String device_id = "maquina-01";
float latitude = -23.55052;
float longitude = -46.633308;

void setup() {
  Serial.begin(115200);
  
  // Conectar WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
  
  // Configurar MQTT
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Enviar dados a cada 5 segundos
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 5000) {
    sendMachineData();
    lastSend = millis();
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando ao MQTT...");
    if (client.connect("ESP32Client")) {
      Serial.println("conectado!");
    } else {
      Serial.print("falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5s");
      delay(5000);
    }
  }
}

void sendMachineData() {
  // Ler sensores (exemplo - ajuste conforme seus sensores)
  float vibration = readVibration();
  float temperature = readTemperature();
  float current = readCurrent();
  
  // Inferência do modelo (exemplo)
  bool anomalyDetected = false;
  float anomalyScore = 0.15;
  String severity = "low";
  String anomalyType = "none";
  
  // Se você tem o modelo Edge Impulse:
  // float prediction = runInference();
  // if (prediction > 0.7) {
  //   anomalyDetected = true;
  //   anomalyScore = prediction;
  //   severity = prediction > 0.9 ? "high" : "medium";
  //   anomalyType = "bearing";
  // }
  
  // Criar JSON
  StaticJsonDocument<512> doc;
  doc["device_id"] = device_id;
  doc["timestamp"] = getISOTimestamp();
  
  JsonObject location = doc.createNestedObject("location");
  location["lat"] = latitude;
  location["lng"] = longitude;
  
  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["vibration"] = vibration;
  sensors["temperature"] = temperature;
  sensors["current"] = current;
  
  JsonObject anomaly = doc.createNestedObject("anomaly");
  anomaly["detected"] = anomalyDetected;
  anomaly["score"] = anomalyScore;
  anomaly["severity"] = severity;
  anomaly["type"] = anomalyType;
  
  // Serializar e publicar
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);
  
  Serial.println("Publicando: ");
  Serial.println(jsonBuffer);
  
  client.publish(mqtt_topic, jsonBuffer);
}

String getISOTimestamp() {
  // Você pode usar NTP para hora real
  // Por enquanto, retorna um timestamp simples
  unsigned long seconds = millis() / 1000;
  char buffer[25];
  sprintf(buffer, "2025-12-06T%02lu:%02lu:%02luZ", 
          (seconds / 3600) % 24, 
          (seconds / 60) % 60, 
          seconds % 60);
  return String(buffer);
}

float readVibration() {
  // Implementar leitura do sensor de vibração
  // Exemplo com valores aleatórios para teste
  return random(0, 100) / 1000.0;
}

float readTemperature() {
  // Implementar leitura do sensor de temperatura
  return random(600, 850) / 10.0;
}

float readCurrent() {
  // Implementar leitura do sensor de corrente
  return random(18, 30) / 10.0;
}
```

### 2. Bibliotecas Necessárias

Instale via Arduino IDE (Tools > Manage Libraries):
- **PubSubClient** by Nick O'Leary
- **ArduinoJson** by Benoit Blanchon

### 3. Configuração de Rede

#### Opção A: ESP32 e PC na mesma rede local
```cpp
// No código ESP32:
const char* mqtt_server = "192.168.1.100";  // IP do seu PC

// No seu PC, descobrir o IP:
ip addr show  # Linux
ipconfig      # Windows
ifconfig      # macOS
```

#### Opção B: Broker MQTT público (teste)
```cpp
// No código ESP32:
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

// No .env.local do Dashboard:
NEXT_PUBLIC_MQTT_BROKER=ws://broker.hivemq.com:8000/mqtt
```

⚠️ **Atenção**: Brokers públicos não são seguros para produção!

### 4. Checklist de Integração

- [ ] ESP32 conectado ao WiFi
- [ ] Mosquitto rodando no PC
- [ ] Dashboard rodando (`npm run dev`)
- [ ] Mesmo tópico configurado em ambos
- [ ] Firewall liberado (porta 1883 e 9001)
- [ ] Testar com `mosquitto_sub`:
  ```bash
  mosquitto_sub -h localhost -p 1883 -t "machines/anomalies"
  ```

### 5. Troubleshooting

#### ESP32 não conecta ao MQTT
```cpp
// Adicionar debug:
void reconnect() {
  Serial.print("Estado WiFi: ");
  Serial.println(WiFi.status());
  Serial.print("Tentando MQTT em: ");
  Serial.println(mqtt_server);
  // ...
}
```

#### Dashboard não recebe dados
1. Verificar console do navegador (F12)
2. Testar broker com:
   ```bash
   mosquitto_sub -h localhost -p 1883 -t "#" -v
   ```
3. Verificar se WebSocket está habilitado no Mosquitto

#### Payload inválido
- Usar ferramenta online para validar JSON
- Verificar se todos os campos estão presentes
- Checar tipos de dados (number vs string)

### 6. Integração com Edge Impulse

Se você já tem o modelo treinado:

```cpp
#include <edge_impulse_inferencing.h>

float runInference() {
  // Capturar áudio
  int16_t buffer[EI_CLASSIFIER_RAW_SAMPLE_COUNT];
  captureAudio(buffer);
  
  // Preparar features
  signal_t signal;
  signal.total_length = EI_CLASSIFIER_RAW_SAMPLE_COUNT;
  signal.get_data = &get_signal_data;
  
  // Executar inferência
  ei_impulse_result_t result = { 0 };
  EI_IMPULSE_ERROR res = run_classifier(&signal, &result, false);
  
  // Retornar score de anomalia
  return result.classification[1].value;  // Ajustar índice conforme modelo
}
```

### 7. Estrutura Completa do Sistema

```
┌─────────────┐
│   ESP32     │
│ + INMP441   │
│ + Modelo ML │
└──────┬──────┘
       │ WiFi
       ↓
┌─────────────┐
│   Mosquitto │
│  MQTT Broker│
└──────┬──────┘
       │ WebSocket
       ↓
┌─────────────┐
│  Dashboard  │
│  (Next.js)  │
└─────────────┘
```

### 8. Exemplo de Teste Completo

```bash
# Terminal 1: Iniciar Mosquitto
mosquitto -c /etc/mosquitto/mosquitto.conf -v

# Terminal 2: Monitor MQTT
mosquitto_sub -h localhost -p 1883 -t "machines/anomalies" -v

# Terminal 3: Dashboard
cd web
npm run dev

# Então: Upload do código no ESP32 via Arduino IDE
```

### 9. Próximos Passos

1. ✅ Testar conexão básica ESP32 → MQTT
2. ✅ Verificar recepção no dashboard
3. 🔄 Integrar sensores reais
4. 🔄 Adicionar modelo Edge Impulse
5. 🔄 Ajustar thresholds de anomalia
6. 🔄 Implementar GPS para localização real

### 10. Recursos Úteis

- [PubSubClient Examples](https://github.com/knolleary/pubsubclient/tree/master/examples)
- [ArduinoJson Assistant](https://arduinojson.org/v6/assistant/)
- [Edge Impulse Arduino Library](https://docs.edgeimpulse.com/docs/deployment/running-your-impulse-arduino)
- [Mosquitto Configuration](https://mosquitto.org/man/mosquitto-conf-5.html)

## 🎉 Sucesso!

Quando tudo estiver funcionando, você verá:
- Marcadores aparecendo no mapa em tempo real
- Cards atualizando com dados dos sensores
- Alertas quando anomalias forem detectadas
- Status "Conectado" no header do dashboard
