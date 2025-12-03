# Projeto_ESP32_Anomalias_Maquinarios_Industrial

Sistema completo de detecção de anomalias em maquinários industriais com solução embarcada (ESP32 + INMP441), modelo de Machine Learning (Edge Impulse) e dashboard web com mapa interativo para monitoramento em tempo real.

Este repositório contém principalmente a parte do front‑end (dashboard e mapas), enquanto a proposta e a implementação do protótipo embarcado estão em:

## Visão geral do sistema (end‑to‑end)

- Dispositivo embarcado (ESP32):
  - Captura áudio com microfone I2S INMP441.
  - Armazena gravações em microSD.
  - Executa inferência local usando o modelo exportado pelo Edge Impulse (biblioteca C++).
  - Mostra status no display LCD I2C e permite iniciar gravação por botão físico.

- Machine Learning:
  - Treinamento com MIMII Dataset (válvulas solenoides) usando MFCC + rede neural.
  - Exportação do modelo quantizado (int8) e integração ao firmware do ESP32 via Edge Impulse.
  - Processo: extração de MFCC → inferência → probabilidade "normal" vs "anomalia".

- Backend / Telemetria:
  - O ESP32 pode enviar eventos (MQTT / HTTP / WebSocket) com payload JSON (ver seção Formato de Dados).
  - Eventos incluem localização, leituras de sensores e resultado da inferência.

- Front‑end (dashboard + mapa):
  - Recebe e exibe telemetria em tempo real.
  - Lista de máquinas, gráficos temporais, KPIs, painel de alertas.
  - Mapa interativo (Leaflet ou Google Maps) com marcadores coloridos por severidade e clustering.

## Hardware (resumo)

- ESP32‑WROOM (microcontrolador)
- Microfone INMP441 (I2S)
- Módulo microSD (SPI)
- Display LCD 16x2 I2C
- Botão físico para iniciar gravação
- Opcional: case/PCB para integração final

BoM resumida (ver proposta):
- [Proposta_Projeto_ESP32_Anomalias.md](/home/daniel/Downloads/Proposta_Projeto_ESP32_Anomalias.md)

## Formato de dados (payload esperado)

Exemplo de payload JSON enviado ao dashboard / broker:

{
  "device_id": "maquina-01",
  "timestamp": "2025-12-03T12:34:56Z",
  "location": { "lat": -23.55052, "lng": -46.633308 },
  "sensors": { "vibration": 0.12, "temperature": 68.4, "current": 2.3 },
  "anomaly": { "detected": true, "score": 0.86, "severity": "high", "type": "bearing" }
}

(O mesmo formato está referenciado no dashboard deste repositório.)

## Como funciona a inferência embarcada (resumo técnico)

1. Captura de áudio por 10 s (configurável).
2. Pré‑processamento: normalização e extração de MFCCs (compatível com o pipeline do Edge Impulse).
3. Inferência com modelo quantizado (biblioteca C++ gerada pelo Edge Impulse).
4. Resultado: score de anomalia + classificação → exibido no LCD e enviado ao backend.

Benefícios: baixa latência, privacidade (áudio não enviado), operação off‑line.

## Instalação e execução (rápido)

- Firmware (ESP32):
  - Importar a biblioteca gerada pelo Edge Impulse (arquivo .h/.cpp) para o projeto Arduino/PlatformIO.
  - Configurar pinos I2S, SPI (microSD) e I2C (LCD) conforme o esquema de montagem.
  - Compilar e gravar no ESP32 com Arduino IDE ou PlatformIO.

- Dashboard (front‑end):
  - Recomendado: Node.js + framework (React / Vue).
  - Instalar dependências:
    ```sh
    npm install
    npm run dev
    ```
  - Configurar conexão a broker MQTT / WebSocket ou endpoint HTTP que receberá os payloads do ESP32.

## Mapa e visualização

- Implementar com Leaflet (react‑leaflet) ou Google Maps.
- Marcadores codificados por severidade: verde/amarelo/vermelho.
- Popups com link para painel da máquina e histórico.
- Usar marker clustering quando houver muitos dispositivos.

## Desenvolvimento e testes

- Testar parsers de payload (unit tests).
- Simular eventos via MQTT/WS para validar atualização do mapa e KPIs.
- Validar pipeline completo: gravação → inferência local → envio → dashboard.

## Boas práticas e limitações

- Validar e sanitizar todos os payloads antes de renderizar.
- Debounce / rate limit de atualizações do mapa para preservar performance.
- Design do modelo balanceado para reduzir falsos negativos em anomalias raras.
- Limitações: o treinamento não é feito no ESP32; sensores adicionais (vibração/temperatura) não estão incluídos no escopo inicial.

## Referências e documentos do projeto

- MIMII Dataset — referência usada no treinamento (ver proposta).
