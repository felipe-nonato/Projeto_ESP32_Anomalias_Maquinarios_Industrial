# 🔧 Correção do Tópico MQTT

## ✅ Problema Resolvido

O ESP32 estava enviando dados para o tópico `/machine/audio/inference`, mas o frontend estava escutando `machines/anomalies`.

## 📝 Mudanças Realizadas

### 1. Frontend (`app/page.tsx`)
- **Antes:** `const MQTT_TOPIC = 'machines/anomalies'`
- **Depois:** `const MQTT_TOPIC = '/machine/audio/inference'`

### 2. Script de Monitoramento (`monitor-esp32.sh`)
- Atualizado para monitorar o tópico correto: `/machine/audio/inference`

### 3. Script de Teste (`test-mqtt.sh`)
- Atualizado para enviar mensagens no tópico correto

### 4. Documentação (`MQTT_FORMAT.md`)
- Exemplos atualizados com o tópico correto

## 🚀 Como Usar

### Monitorar Dados do ESP32
```bash
cd web
./monitor-esp32.sh
```

### Testar o Dashboard (Enviar Dados Simulados)
```bash
cd web
./test-mqtt.sh
```

### Enviar Mensagem Manual
```bash
# Normal
mosquitto_pub -h localhost -p 1883 -t /machine/audio/inference \
  -m '{"label":"normal","score":0.95}'

# Anomalia
mosquitto_pub -h localhost -p 1883 -t /machine/audio/inference \
  -m '{"label":"anomalous","score":0.85}'
```

## 🔄 Reiniciar o Frontend

Se o frontend já estava rodando, você precisa reiniciá-lo para que as mudanças tenham efeito:

```bash
# Parar o processo atual
pkill -f "next"

# Ou use Ctrl+C no terminal onde está rodando

# Depois inicie novamente
cd web
npm run dev
```

## 📊 Formato dos Dados

O ESP32 envia dados no formato:
```json
{
  "label": "normal",      // ou "anomalous"
  "score": 0.855          // 0.0 a 1.0
}
```

### Interpretação no Dashboard:
- **Normal** (Verde): `label: "normal"` ou `score < 0.5`
- **Warning** (Amarelo): `label: "anomalous"` + `0.5 < score ≤ 0.8`
- **Critical** (Vermelho): `label: "anomalous"` + `score > 0.8`

## ✅ Verificar se Está Funcionando

1. Abra o navegador em `http://localhost:3000`
2. Verifique se mostra "Conectado" no canto superior direito
3. Execute o script de teste: `./test-mqtt.sh`
4. Veja as máquinas aparecendo no dashboard em tempo real

## 🐛 Debug

Se ainda não aparecer, verifique:

1. **Console do Navegador** (F12)
   - Deve mostrar: "Conectado ao broker MQTT"
   - Deve mostrar: "Inscrito no tópico: /machine/audio/inference"
   - Deve mostrar: "Dados recebidos do MQTT: {...}"

2. **Logs do Mosquitto**
   ```bash
   sudo docker logs -f mqtt-broker
   ```

3. **Monitorar Tópico**
   ```bash
   sudo docker exec mqtt-broker mosquitto_sub -h localhost -t '#' -v
   ```
