# Express API Server - ESP32 Anomaly Detection

Backend server para receber, armazenar e servir dados de anomalias do ESP32.

## 🚀 Características

- ✅ Recebe dados MQTT do ESP32
- ✅ Armazena dados em SQLite
- ✅ API REST para consultas
- ✅ WebSocket para atualizações em tempo real
- ✅ Estatísticas e agregações
- ✅ Limpeza automática de dados antigos

## 📦 Instalação

```bash
cd server
npm install
```

## 🔧 Configuração

Crie um arquivo `.env` (opcional):

```env
PORT=3001
MQTT_BROKER=mqtt://localhost:1883
MQTT_TOPIC=/machine/audio/inference
```

## ▶️ Execução

### Modo de Produção
```bash
npm start
```

### Modo de Desenvolvimento (com auto-reload)
```bash
npm run dev
```

## 📡 API Endpoints

### Health Check
```bash
GET /api/health
```

Resposta:
```json
{
  "status": "ok",
  "mqtt": "connected",
  "timestamp": "2025-12-06T10:30:00.000Z"
}
```

### Buscar Últimas Leituras
```bash
GET /api/readings?limit=50
```

Resposta:
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "id": 1,
      "device_id": "ESP32_Anomalia",
      "label": "normal",
      "score": 0.855,
      "status": "normal",
      "severity": "low",
      "timestamp": "2025-12-06 10:30:00",
      "created_at": "2025-12-06 10:30:00"
    }
  ]
}
```

### Buscar Leituras por Período
```bash
GET /api/readings/period?start=2025-12-01&end=2025-12-06
```

### Estatísticas Gerais (24h)
```bash
GET /api/stats
```

Resposta:
```json
{
  "success": true,
  "data": {
    "total": 1234,
    "normal": 1000,
    "warning": 150,
    "critical": 84,
    "avg_score": 0.645,
    "last_update": "2025-12-06 10:30:00"
  }
}
```

### Estatísticas por Dispositivo
```bash
GET /api/stats/devices
```

### Inserir Leitura Manual (para testes)
```bash
POST /api/readings
Content-Type: application/json

{
  "device_id": "ESP32_Test",
  "label": "anomalous",
  "score": 0.92
}
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: readings
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| device_id | TEXT | ID do dispositivo |
| label | TEXT | "normal" ou "anomalous" |
| score | REAL | Score de confiança (0-1) |
| status | TEXT | "normal", "warning" ou "critical" |
| severity | TEXT | "low", "medium" ou "high" |
| timestamp | DATETIME | Timestamp da leitura |
| created_at | DATETIME | Timestamp de criação |

### Tabela: daily_stats
Estatísticas agregadas por dia para análises históricas.

## 🧪 Testando a API

### Usando curl
```bash
# Health check
curl http://localhost:3001/api/health

# Buscar leituras
curl http://localhost:3001/api/readings?limit=10

# Estatísticas
curl http://localhost:3001/api/stats

# Inserir leitura de teste
curl -X POST http://localhost:3001/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "ESP32_Test",
    "label": "anomalous",
    "score": 0.92
  }'
```

### Usando o script de teste
```bash
npm test
```

## 🌐 WebSocket

O servidor também suporta WebSocket para atualizações em tempo real:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('new-reading', (data) => {
  console.log('Nova leitura:', data);
});
```

## 🔄 Integração com Frontend Next.js

Atualize o frontend para buscar dados do servidor Express:

```typescript
// Buscar dados históricos
const response = await fetch('http://localhost:3001/api/readings?limit=100');
const { data } = await response.json();

// Buscar estatísticas
const statsResponse = await fetch('http://localhost:3001/api/stats');
const { data: stats } = await statsResponse.json();
```

## 📊 Arquivos

- `index.js` - Servidor Express e configuração MQTT
- `database.js` - Funções do banco de dados SQLite
- `anomalies.db` - Banco de dados SQLite (criado automaticamente)
- `package.json` - Dependências do projeto

## 🧹 Manutenção

O servidor automaticamente:
- Limpa dados com mais de 30 dias (executa diariamente)
- Atualiza estatísticas diárias após cada leitura
- Reconecta ao MQTT em caso de desconexão

## 🐛 Debug

Logs coloridos para facilitar o debug:
- 🚀 Inicialização
- ✅ Sucesso
- 📨 Mensagens recebidas
- 💾 Salvamentos no banco
- ❌ Erros
- 🔌 Conexões WebSocket
