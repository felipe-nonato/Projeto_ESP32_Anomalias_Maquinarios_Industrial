# Definições

### ✔ ROTAS MQTT = TÓPICOS MQTT

Ou seja,essa lista tem:

Em quais tópicos o ESP32 publica

Em quais tópicos o ESP32 pode assinar (se existir)

Formato das mensagens publicadas

Se existe JSON, campos, estrutura, exemplos

No MQTT, tópico = rota.

### ✔ QUAL O RETORNO = JSON enviado


Qual é a estrutura da mensagem

Quais campos aparecem

Tipos dos valores (string, número etc.)

Exemplo real de payload


### config
IP: 192.168.1.14(ip da maquina)

Porta: 1883

Protocolo: MQTT TCP

Autenticação: Não requer

QoS recomendado: 0

## 📍 Tópico Principal (Publicação)
1. /machine/audio/inference

Enviado sempre após o ESP32 gravar áudio → rodar inferência → classificar.

## 📤 Payload (JSON):
{
  "label": "normal",
  "score": 0.987
}

## 📝 Descrição dos campos
Campo	Tipo	Descrição
label	string	Resultado da classificação. Pode ser "normal" ou "anomalous".
score	float	Confiança do modelo na classe escolhida. Varia entre 0 e 1.
## 🧪 Exemplos Reais de Mensagens
### 🔹 Evento normal
{
  "label": "normal",
  "score": 0.992
}

### 🔹 Evento anômalo
{
  "label": "anomalous",
  "score": 0.734
}

## 📡 Possíveis tópicos futuros (não implementados ainda, mas previstos)
### 2. /machine/status (opcional)

Status do dispositivo (uptime, RSSI, etc.)

Exemplo:

{
  "status": "online",
  "uptime": 20343,
  "wifi_rssi": -61
}

### 3. /machine/command (opcional)

Tópico para enviar comandos ao ESP32.

Exemplo:

{
  "action": "start_record"
}


## ⚠ Atualmente NÃO implementado.

### 🛠 Modelo de Mensagem Consolidado

Você pode passar para o UI/UX:

Evento

tipo: "audio_inference"

valor: "normal" / "anomalous"

intensidade/confiança: score float

timestamp (gerado no front)

## 💡 O front-end deve fazer

Conectar ao MQTT

Assinar o tópico:

/machine/audio/inference


Receber JSON e interpretar o campo "label"


histórico

último evento
