# Dashboard Web - Monitoramento de Anomalias Industriais

Dashboard interativo desenvolvido em Next.js 16 para monitoramento em tempo real de anomalias em maquinários industriais através de MQTT.

## 🚀 Funcionalidades

- **Conexão MQTT em tempo real** - Recebe dados dos dispositivos ESP32
- **Mapa interativo** - Visualização geográfica das máquinas com Leaflet
- **KPIs e Estatísticas** - Cards com resumo do status das máquinas
- **Alertas de Anomalias** - Notificações visuais quando anomalias são detectadas
- **Dashboard Responsivo** - Interface adaptável para desktop e mobile
- **Modo Escuro** - Suporte automático ao tema escuro

## 📦 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **MQTT.js** - Cliente MQTT para browser
- **React Leaflet** - Mapa interativo com OpenStreetMap
- **Lucide React** - Ícones modernos

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Copiar e configurar variáveis de ambiente
cp .env.example .env.local
```

## ⚙️ Configuração

Edite o arquivo `.env.local`:

```env
NEXT_PUBLIC_MQTT_BROKER=ws://localhost:9001
NEXT_PUBLIC_MQTT_TOPIC=machines/anomalies
```

### Configurar Broker MQTT (Mosquitto)

```bash
# Instalar Mosquitto
sudo apt-get install mosquitto mosquitto-clients

# Configurar WebSocket em /etc/mosquitto/mosquitto.conf
listener 1883
protocol mqtt

listener 9001
protocol websockets

# Reiniciar serviço
sudo systemctl restart mosquitto
```

## 🎯 Executar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

Acesse: http://localhost:3000

## 📊 Formato de Dados MQTT

O ESP32 deve publicar no formato JSON:

```json
{
  "device_id": "maquina-01",
  "timestamp": "2025-12-06T12:34:56Z",
  "location": {"lat": -23.55052, "lng": -46.633308},
  "sensors": {"vibration": 0.12, "temperature": 68.4, "current": 2.3},
  "anomaly": {"detected": true, "score": 0.86, "severity": "high", "type": "bearing"}
}
```

## 🧪 Testar com Dados Simulados

```bash
mosquitto_pub -h localhost -p 1883 -t "machines/anomalies" -m '{
  "device_id": "maquina-teste",
  "timestamp": "2025-12-06T12:00:00Z",
  "location": {"lat": -23.55052, "lng": -46.633308},
  "sensors": {"vibration": 0.15, "temperature": 72.5, "current": 2.8},
  "anomaly": {"detected": true, "score": 0.92, "severity": "high", "type": "bearing"}
}'
```

## 🗂️ Estrutura

```
app/
├── components/
│   ├── MapComponent.tsx      # Mapa Leaflet
│   ├── MachineCard.tsx       # Card de máquina
│   └── StatsCards.tsx        # KPIs
├── hooks/
│   └── useMQTT.ts            # Hook MQTT
├── types.ts                   # Tipos TypeScript
└── page.tsx                  # Página principal
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
