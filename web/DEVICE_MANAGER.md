# 📱 Módulo de Gerenciamento de Dispositivos

## Visão Geral

O módulo de gerenciamento permite cadastrar, editar e organizar os dispositivos ESP32 que enviam dados para o dashboard. Cada dispositivo pode ter:

- **Nome personalizado** (ex: "Máquina de Corte 01")
- **Descrição** detalhada
- **Localização GPS** precisa
- **Identificação única** via MAC Address

## 🚀 Como Usar

### 1. Acessar o Gerenciador

Clique no botão **"Dispositivos"** no canto superior direito do dashboard.

### 2. Adicionar Novo Dispositivo

1. Clique em **"Adicionar Novo Dispositivo"**
2. Preencha os campos obrigatórios:
   - **ID do Dispositivo**: MAC Address do ESP32 sem ':' (ex: `A1B2C3D4E5F6`)
   - **Nome do Dispositivo**: Nome descritivo (ex: `Máquina de Corte 01`)
3. Preencha os campos opcionais:
   - **Descrição**: Informações adicionais sobre o equipamento
   - **Latitude/Longitude**: Coordenadas GPS precisas
4. Clique em **"Adicionar"**

### 3. Editar Dispositivo

1. Clique no ícone de **edição** (lápis) no card do dispositivo
2. Modifique as informações desejadas
3. Clique em **"Salvar"**

### 4. Excluir Dispositivo

1. Clique no ícone de **exclusão** (lixeira) no card do dispositivo
2. Confirme a exclusão

## 🔍 Obtendo o Device ID (MAC Address)

### No ESP32

Adicione este código ao `setup()` do seu projeto:

```cpp
void setup() {
  Serial.begin(115200);
  
  // Conectar ao WiFi primeiro
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  
  // Obter e exibir MAC Address
  String mac = WiFi.macAddress();
  String deviceID = mac;
  deviceID.replace(":", ""); // Remove os ':'
  
  Serial.println("=========================");
  Serial.println("MAC Address: " + mac);
  Serial.println("Device ID: " + deviceID);
  Serial.println("=========================");
}
```

### No Serial Monitor

Após fazer upload do código, abra o Serial Monitor (115200 baud) e você verá:

```
=========================
MAC Address: A1:B2:C3:D4:E5:F6
Device ID: A1B2C3D4E5F6
=========================
```

Use o **Device ID** (sem ':') para cadastrar o dispositivo no dashboard.

## 📍 Coordenadas GPS

### Como Obter Coordenadas

1. **Google Maps**:
   - Clique com botão direito no local desejado
   - Selecione as coordenadas que aparecem
   - Formato: `-23.550520, -46.633309`

2. **GPS do Celular**:
   - Use apps como "GPS Status" ou "Coordinates"
   - Anote latitude e longitude

3. **Coordenadas Padrão**:
   - Se não souber a localização exata, use as coordenadas da empresa/fábrica
   - Padrão: São Paulo (`-23.5505, -46.6333`)

### Formato das Coordenadas

- **Latitude**: Valor entre -90 e 90 (negativo para Sul)
- **Longitude**: Valor entre -180 e 180 (negativo para Oeste)
- **Precisão**: 6 casas decimais (~10cm de precisão)

## 💾 Armazenamento

Os dados dos dispositivos são salvos no **localStorage** do navegador, o que significa:

✅ **Vantagens**:
- Persistência local (não requer servidor)
- Acesso rápido
- Privacidade dos dados

⚠️ **Limitações**:
- Dados são específicos do navegador/computador
- Limpar cache/dados do navegador apaga os dispositivos
- Não sincroniza entre dispositivos diferentes

## 🔄 Integração Automática

Quando um dispositivo cadastrado envia dados via MQTT:

1. O sistema identifica o `device_id` recebido
2. Busca as informações cadastradas no gerenciador
3. Exibe o **nome personalizado** nos cards e gráficos
4. Posiciona o marcador no **mapa** usando as coordenadas cadastradas

### Dispositivos Não Cadastrados

Se um ESP32 enviar dados sem estar cadastrado:
- Aparece com nome genérico: `Dispositivo A1B2C3D4`
- Localização padrão: São Paulo
- Funciona normalmente, mas sem personalização

## 📊 Exemplo Completo

### 1. Preparar o ESP32

```cpp
// No main.ino
String deviceID = WiFi.macAddress();
deviceID.replace(":", "");

String jsonMsg = 
  "{\"device_id\": \"" + deviceID + 
  "\", \"label\": \"" + (isAnomalia ? "anomalous" : "normal") + 
  "\", \"score\": " + String(score, 3) + "}";

client.publish("machines/anomalies", jsonMsg.c_str());
```

### 2. Cadastrar no Dashboard

- **ID**: `A1B2C3D4E5F6`
- **Nome**: `Torno CNC - Setor A`
- **Descrição**: `Torno automático modelo XYZ-2000, instalado em 2023`
- **Lat**: `-23.550520`
- **Lng**: `-46.633309`

### 3. Resultado

O dashboard mostrará:
- Cards com nome "Torno CNC - Setor A"
- Marcador no mapa na localização especificada
- Histórico de anomalias do dispositivo

## 🛠️ Dicas e Melhores Práticas

### Nomenclatura de Dispositivos

✅ **Bom**:
- `Torno CNC - Setor A`
- `Prensa Hidráulica 01`
- `Fresadora - Linha 2`

❌ **Evitar**:
- `Máquina`
- `ESP32`
- `Dispositivo 1`

### Descrições Úteis

Inclua informações como:
- Modelo do equipamento
- Ano de instalação
- Setor/linha de produção
- Responsável pela manutenção
- Número de patrimônio

### Organização

- Use nomes padronizados
- Agrupe por setor/área
- Mantenha as coordenadas atualizadas
- Revise periodicamente os cadastros

## 🔒 Segurança

- Os dados são armazenados apenas no navegador
- Não há transmissão para servidores externos
- Device IDs são únicos e não contêm informações sensíveis
- Recomenda-se backup regular dos dados (export/import em futuras versões)

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique se o device_id está correto
2. Confirme que o ESP32 está enviando os dados
3. Verifique o console do navegador (F12) para erros
4. Teste com o script `test-mqtt.sh` incluído no projeto
