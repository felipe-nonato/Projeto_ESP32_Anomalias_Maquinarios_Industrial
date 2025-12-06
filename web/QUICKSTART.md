# 🚀 Quick Start - Dashboard em 5 minutos

## Opção 1: Testar com Docker (mais fácil)

```bash
# 1. Iniciar o broker MQTT
cd web
docker-compose up -d

# 2. Instalar e executar o dashboard
npm install
npm run dev

# 3. Em outro terminal, enviar dados de teste
./test-mqtt.sh

# 4. Abrir no navegador
# http://localhost:3000
```

## Opção 2: Instalação Manual

```bash
# 1. Instalar Mosquitto
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients

# 2. Configurar Mosquitto para WebSocket
sudo nano /etc/mosquitto/mosquitto.conf
# Adicionar:
listener 1883
protocol mqtt

listener 9001
protocol websockets
allow_anonymous true

# 3. Reiniciar Mosquitto
sudo systemctl restart mosquitto

# 4. Verificar se está rodando
mosquitto_sub -h localhost -p 1883 -t "test" &
mosquitto_pub -h localhost -p 1883 -t "test" -m "Hello"

# 5. Configurar e executar o dashboard
cd web
npm install
cp .env.example .env.local
npm run dev

# 6. Testar com dados simulados
./test-mqtt.sh

# 7. Abrir no navegador
# http://localhost:3000
```

## 🎯 O que você deve ver

1. **Header**: "Dashboard de Anomalias Industriais" com status "Conectado" 🟢
2. **Cards de KPIs**: 
   - Total de Máquinas: 4
   - Normal: 2
   - Avisos: 1
   - Crítico: 1
   - Anomalias: 2
3. **Mapa**: 4 marcadores coloridos (2 verdes, 1 amarelo, 1 vermelho)
4. **Lista**: 4 cards de máquinas com detalhes

## 🔍 Debug

### Problema: Dashboard mostra "Desconectado"
```bash
# Verificar se Mosquitto está rodando
sudo systemctl status mosquitto

# Testar conexão
mosquitto_sub -h localhost -p 1883 -t "#" -v
```

### Problema: Marcadores não aparecem no mapa
- Abra F12 (DevTools) no navegador
- Veja o console por erros
- Verifique se há mensagens MQTT sendo recebidas

### Problema: Script test-mqtt.sh falha
```bash
# Verificar se mosquitto_pub está instalado
which mosquitto_pub

# Se não estiver, instalar
sudo apt-get install mosquitto-clients
```

## 📱 Próximo Passo: Conectar ESP32

Veja o guia completo em: `INTEGRACAO_ESP32.md`

Código básico para ESP32:
```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* mqtt_server = "SEU_IP_AQUI";  // IP do seu PC
const char* mqtt_topic = "machines/anomalies";

// ... ver INTEGRACAO_ESP32.md para código completo
```

## 🎉 Pronto!

Agora você tem um dashboard funcionando que:
- ✅ Conecta via MQTT em tempo real
- ✅ Mostra máquinas em mapa interativo
- ✅ Exibe alertas de anomalias
- ✅ Funciona no modo claro e escuro
- ✅ É totalmente responsivo

**Próximos passos:**
1. Configurar seu ESP32 (ver INTEGRACAO_ESP32.md)
2. Ajustar coordenadas GPS reais
3. Integrar modelo Edge Impulse
4. Adicionar mais sensores

## 📚 Documentação

- `README.md` - Visão geral completa
- `IMPLEMENTACAO.md` - Detalhes da implementação
- `INTEGRACAO_ESP32.md` - Como conectar o ESP32
- `example-payload.json` - Formato dos dados
- `test-mqtt.sh` - Script de teste

---

**Dúvidas?** Verifique os logs:
```bash
# Logs do Mosquitto
sudo journalctl -u mosquitto -f

# Logs do Docker (se usar)
docker logs mqtt-broker -f
```
