# Dashboard Web - Sistema Completo ✅

## ✨ O que foi implementado

### 1. **Estrutura do Projeto**
- ✅ Configuração Next.js 16 com TypeScript
- ✅ Tailwind CSS 4 para estilização
- ✅ Tipos TypeScript para dados das máquinas

### 2. **Componentes Criados**

#### `MapComponent.tsx`
- Mapa interativo usando Leaflet e OpenStreetMap
- Marcadores coloridos por severidade (verde/amarelo/vermelho)
- Popups com informações detalhadas ao clicar
- Atualização dinâmica em tempo real

#### `MachineCard.tsx`
- Card visual para cada máquina
- Exibe temperatura, vibração e corrente
- Alerta destacado quando anomalia é detectada
- Código de cores por status

#### `StatsCards.tsx`
- 5 cards de KPIs:
  - Total de máquinas
  - Status normal
  - Avisos
  - Críticos
  - Anomalias detectadas

### 3. **Integração MQTT**

#### `useMQTT.ts` (Hook customizado)
- Conexão automática ao broker MQTT
- Subscrição ao tópico configurado
- Parser de mensagens JSON
- Atualização de estado em tempo real
- Indicador de status de conexão
- Reconexão automática

### 4. **Página Principal (`page.tsx`)**
- Header com logo e status de conexão
- Cards de estatísticas no topo
- Abas para alternar entre Mapa e Lista
- Mensagem de aguardando dados quando vazio
- Info box com instruções de uso
- Totalmente responsivo

### 5. **Configuração**
- `.env.example` - Template de configuração
- `.env.local` - Configuração local
- Variáveis de ambiente:
  - `NEXT_PUBLIC_MQTT_BROKER` - URL do broker
  - `NEXT_PUBLIC_MQTT_TOPIC` - Tópico MQTT

### 6. **Ferramentas de Teste**
- `example-payload.json` - Exemplo de payload
- `test-mqtt.sh` - Script bash para simular 4 máquinas

### 7. **Documentação**
- README.md atualizado com instruções completas
- Formato de dados documentado
- Instruções de instalação e configuração
- Guia de troubleshooting

## 📦 Dependências Instaladas

```json
{
  "mqtt": "Cliente MQTT para browser",
  "react-leaflet": "Componentes React para Leaflet",
  "leaflet": "Biblioteca de mapas interativos",
  "recharts": "Biblioteca de gráficos (futuro uso)",
  "lucide-react": "Ícones modernos",
  "@types/leaflet": "Tipos TypeScript para Leaflet"
}
```

## 🚀 Como Usar

### Passo 1: Configurar Broker MQTT
```bash
# Instalar Mosquitto
sudo apt-get install mosquitto mosquitto-clients

# Editar /etc/mosquitto/mosquitto.conf
listener 1883
protocol mqtt

listener 9001
protocol websockets

# Reiniciar
sudo systemctl restart mosquitto
```

### Passo 2: Executar Dashboard
```bash
cd web
npm install
npm run dev
```

### Passo 3: Testar com Dados Simulados
```bash
# Terminal 1: Dashboard rodando
npm run dev

# Terminal 2: Enviar dados de teste
./test-mqtt.sh
```

## 🎯 Fluxo de Dados

```
ESP32 → MQTT Broker → WebSocket → Dashboard
                         ↓
                    useMQTT Hook
                         ↓
                   React State
                         ↓
           ┌─────────────┴──────────────┐
           ↓                            ↓
      MapComponent                 MachineCard
      (Visualização)               (Lista)
```

## 📊 Formato de Dados Esperado

```typescript
interface MachineData {
  device_id: string;           // ID único da máquina
  timestamp: string;           // ISO 8601
  location: {
    lat: number;              // Latitude
    lng: number;              // Longitude
  };
  sensors: {
    vibration: number;         // Nível de vibração
    temperature: number;       // Temperatura em °C
    current: number;           // Corrente em A
  };
  anomaly: {
    detected: boolean;         // Se anomalia foi detectada
    score: number;            // Confiança (0-1)
    severity: "low" | "medium" | "high";
    type: string;             // Tipo de anomalia
  };
}
```

## 🎨 Design

### Cores do Status
- 🟢 Verde (`#22c55e`) - Normal
- 🟡 Amarelo (`#f59e0b`) - Warning
- 🔴 Vermelho (`#ef4444`) - Critical

### Temas
- ✅ Light mode
- ✅ Dark mode (automático)

## 🔧 Próximos Passos Sugeridos

1. **Backend/API** (opcional)
   - Salvar histórico em banco de dados
   - API REST para consultas
   - Autenticação de usuários

2. **Melhorias no Dashboard**
   - Gráficos temporais com Recharts
   - Filtros por status/tipo
   - Notificações push
   - Export de relatórios PDF

3. **ESP32**
   - Implementar publicação MQTT
   - Ajustar formato do payload
   - Adicionar GPS para localização real

4. **DevOps**
   - Docker compose (broker + dashboard)
   - CI/CD pipeline
   - Deploy em produção

## ✅ Checklist de Implementação

- [x] Configuração do projeto Next.js
- [x] Instalação de dependências
- [x] Tipos TypeScript
- [x] Hook MQTT customizado
- [x] Componente de Mapa
- [x] Componentes de Cards
- [x] Página principal
- [x] Estilização responsiva
- [x] Dark mode
- [x] Variáveis de ambiente
- [x] Script de teste
- [x] Documentação completa

## 🎉 Resultado

Dashboard totalmente funcional e pronto para receber dados MQTT do ESP32!

Acesse: **http://localhost:3000** após executar `npm run dev`
