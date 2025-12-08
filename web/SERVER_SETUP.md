# 🎯 Sistema Completo - Express API + SQLite

## ✅ O Que Foi Criado

### 1. Servidor Express (`web/server/`)
- **API REST** para consultar dados históricos
- **WebSocket** para atualizações em tempo real
- **SQLite** para armazenar todos os dados
- **Integração MQTT** para receber dados do ESP32

### 2. Frontend Atualizado
- **Modo MQTT**: Dados em tempo real direto
- **Modo API**: Dados do banco com histórico
- Botão para alternar entre os modos

## 🚀 Como Usar

### Passo 1: Iniciar MQTT Broker
```bash
cd /home/aryel/codigos/Projeto_ESP32_Anomalias_Maquinarios_Industrial/web
sudo docker compose up -d
```

### Passo 2: Iniciar Servidor Express
```bash
cd /home/aryel/codigos/Projeto_ESP32_Anomalias_Maquinarios_Industrial/web/server
node index.js
```

Você verá:
```
🚀 ESP32 Anomaly Detection API Server
📡 HTTP Server running on: http://localhost:3001
✅ Connected to MQTT broker
📡 Subscribed to topic: /machine/audio/inference
```

### Passo 3: Iniciar Frontend (nova aba)
```bash
cd /home/aryel/codigos/Projeto_ESP32_Anomalias_Maquinarios_Industrial/web
npm run dev
```

### Passo 4: Acessar Dashboard
Abra: **http://localhost:3000**

## 📊 Funcionalidades

### API Endpoints

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/health` | Status do servidor |
| `GET /api/readings?limit=50` | Últimas 50 leituras |
| `GET /api/stats` | Estatísticas (24h) |
| `GET /api/stats/devices` | Stats por dispositivo |

### Banco de Dados SQLite

Localização: `web/server/anomalies.db`

**Tabela readings:**
- Armazena todas as leituras do ESP32
- Calcula status (normal/warning/critical)
- Mantém histórico de 30 dias

**Tabela daily_stats:**
- Estatísticas agregadas por dia
- Atualizada automaticamente

### Frontend com 2 Modos

1. **MQTT Mode** 🔴
   - Dados em tempo real direto do broker
   - Sem histórico
   - Mais rápido

2. **API Mode** 🔵
   - Dados do banco SQLite
   - Com histórico
   - Atualiza a cada 5 segundos

## 🧪 Testando

### Teste 1: API Health Check
```bash
curl http://localhost:3001/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "mqtt": "connected",
  "timestamp": "2025-12-06T..."
}
```

### Teste 2: Enviar Dados via MQTT
```bash
mosquitto_pub -h localhost -p 1883 -t /machine/audio/inference \
  -m '{"label":"anomalous","score":0.95}'
```

### Teste 3: Verificar no Banco
```bash
curl http://localhost:3001/api/readings?limit=1
```

### Teste 4: Ver no Dashboard
- Abra http://localhost:3000
- Clique no botão **API** (canto superior direito)
- Deve aparecer os dados

## 📈 Fluxo de Dados

```
┌─────────┐
│  ESP32  │
└────┬────┘
     │ MQTT publish /machine/audio/inference
     ↓
┌─────────────┐
│ MQTT Broker │ (porta 1883 e 9001)
└──────┬──────┘
       │
       ├──→ Express Server → SQLite → API
       │                              ↓
       └──→ Frontend (MQTT mode)     Frontend (API mode)
```

## 🎯 Interpretação dos Dados

| Label | Score | Status | Cor | Ação |
|-------|-------|--------|-----|------|
| normal | qualquer | normal | 🟢 | Nenhuma |
| anomalous | < 0.5 | normal | 🟢 | Monitor |
| anomalous | 0.5-0.8 | warning | 🟡 | Atenção |
| anomalous | > 0.8 | critical | 🔴 | URGENTE |

## 📁 Arquivos Criados

```
web/
├── server/
│   ├── index.js          ← Servidor Express + MQTT
│   ├── database.js       ← Funções SQLite
│   ├── package.json      ← Dependências
│   ├── test-api.js       ← Script de teste
│   ├── anomalies.db      ← Banco (criado automaticamente)
│   └── README.md         ← Documentação detalhada
│
├── app/
│   ├── page.tsx          ← Atualizado (botão MQTT/API)
│   └── hooks/
│       ├── useMQTT.ts    ← Hook para MQTT direto
│       └── useAPI.ts     ← Hook para API (NOVO)
│
└── TOPICO_CORRIGIDO.md   ← Correção do tópico
```

## 🔧 Manutenção

### Limpar Dados Antigos
O servidor limpa automaticamente dados > 30 dias.

Manual:
```bash
cd web/server
sqlite3 anomalies.db "DELETE FROM readings WHERE timestamp < datetime('now', '-30 days');"
```

### Ver Estatísticas do Banco
```bash
cd web/server
sqlite3 anomalies.db "SELECT COUNT(*) as total, status FROM readings GROUP BY status;"
```

### Logs do Servidor
```bash
cd web/server
tail -f server.log
```

## ⚙️ Configuração (Opcional)

Criar `web/server/.env`:
```env
PORT=3001
MQTT_BROKER=mqtt://localhost:1883
MQTT_TOPIC=/machine/audio/inference
```

## 🐛 Problemas Comuns

### "Cannot connect to API"
```bash
# Verificar se servidor está rodando
curl http://localhost:3001/api/health

# Se não, iniciar:
cd web/server
node index.js
```

### "MQTT disconnected"
```bash
# Verificar broker
sudo docker ps | grep mqtt

# Reiniciar se necessário
sudo docker compose restart
```

### Dados não aparecem no modo API
1. Verificar se dados estão chegando:
```bash
curl http://localhost:3001/api/readings
```

2. Ver logs do servidor:
```bash
cd web/server
cat server.log
```

3. Monitorar MQTT:
```bash
./monitor-esp32.sh
```

## 🎉 Pronto!

Agora você tem um sistema completo com:
- ✅ MQTT Broker funcionando
- ✅ Express API com SQLite
- ✅ Frontend com 2 modos de visualização
- ✅ Histórico de dados
- ✅ Estatísticas em tempo real
- ✅ WebSocket para atualizações instantâneas

**Próximos Passos:**
1. Conectar o ESP32
2. Ver dados aparecendo no dashboard
3. Explorar estatísticas e histórico
4. Personalizar conforme necessário

🚀 **Seu sistema de monitoramento industrial está pronto!**
