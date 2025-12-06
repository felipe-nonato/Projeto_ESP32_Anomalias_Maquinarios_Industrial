#include <Arduino.h>
#include <driver/i2s.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SD.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include "Aryel-project-1_inferencing.h"

// ======================================================================
// ------------------------- CONFIGURAÇÃO MQTT ---------------------------
// ======================================================================
const char* ssid = "brisa-1112219";
const char* password = "fklmqq7m";

// IP da máquina onde o Mosquitto está rodando
const char* mqtt_server = "192.168.1.14";  
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

// ======================================================================
// --------------------------- DEFINES DO PROJETO ------------------------
// ======================================================================

// --- Microfone INMP441 ---
#define I2S_BCLK 21
#define I2S_LRCL 15
#define I2S_DOUT 22

// --- Cartão SD ---
#define SD_MISO 19
#define SD_MOSI 23
#define SD_SCK  18
#define SD_CS   5

// --- LCD ---
#define I2C_SDA 26
#define I2C_SCL 25
LiquidCrystal_I2C lcd(0x27, 16, 2);

// --- Botão ---
#define BUTTON_PIN 4

// --- Parâmetros ---
#define SAMPLE_RATE     16000
#define RECORD_TIME_SEC 10
#define BUFFER_SIZE     1024

const char *filename = "/audio.raw";

// ======================================================================
// ------------------------ FUNÇÕES DE REDE / MQTT ----------------------
// ======================================================================

// Conecta ao WiFi
void setup_wifi() {
  lcd.clear();
  lcd.print("WiFi...");

  WiFi.begin(ssid, password);
  Serial.print("Conectando ao WiFi ");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi conectado!");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.print("WiFi Conectado");
  delay(500);
}

// Reconecta MQTT caso caia
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Conectando MQTT... ");

    if (client.connect("ESP32_Anomalia")) {
      Serial.println("Conectado ao Broker!");
    } else {
      Serial.print("Falhou (rc=");
      Serial.print(client.state());
      Serial.println("), tentando em 5s");
      delay(5000);
    }
  }
}

// ======================================================================
// ----------------------- INICIALIZAÇÃO DO I2S --------------------------
// ======================================================================
void setupI2S() {
  const i2s_config_t i2s_config = {
      .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
      .sample_rate = SAMPLE_RATE,
      .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
      .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
      .communication_format = I2S_COMM_FORMAT_I2S,
      .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
      .dma_buf_count = 8,
      .dma_buf_len = BUFFER_SIZE,
      .use_apll = false,
      .tx_desc_auto_clear = false,
      .fixed_mclk = 0
  };

  const i2s_pin_config_t pin_config = {
      .bck_io_num = I2S_BCLK,
      .ws_io_num = I2S_LRCL,
      .data_out_num = I2S_PIN_NO_CHANGE,
      .data_in_num = I2S_DOUT
  };

  i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &pin_config);
  i2s_set_clk(I2S_NUM_0, SAMPLE_RATE, I2S_BITS_PER_SAMPLE_32BIT, I2S_CHANNEL_MONO);
}

// ======================================================================
// ---------------------- GRAVAÇÃO DIRETO NO SD --------------------------
// ======================================================================
bool recordToSD(const char *filename, int seconds) {
  File audioFile = SD.open(filename, FILE_WRITE);
  if (!audioFile) {
    lcd.clear();
    lcd.print("Erro SD!");
    return false;
  }

  lcd.clear();
  lcd.print("Gravando...");
  Serial.println("Gravando...");

  int totalSamples = SAMPLE_RATE * seconds;
  int32_t buffer32[BUFFER_SIZE];
  int samplesWritten = 0;
  size_t bytesRead;
  unsigned long start = millis();

  while (samplesWritten < totalSamples) {
    size_t bytesToRead = BUFFER_SIZE * sizeof(int32_t);
    i2s_read(I2S_NUM_0, (void*)buffer32, bytesToRead, &bytesRead, portMAX_DELAY);

    int samples = bytesRead / sizeof(int32_t);
    for (int i = 0; i < samples; i++) {
      int16_t s = (int16_t)(buffer32[i] >> 14);
      audioFile.write((byte*)&s, sizeof(int16_t));
    }

    samplesWritten += samples;
    if (millis() - start > seconds * 1000) break;
  }

  audioFile.close();

  lcd.clear();
  lcd.print("OK Gravado!");
  return true;
}

// ======================================================================
// ------------------------------- SETUP --------------------------------
// ======================================================================
void setup() {
  Serial.begin(115200);

  Wire.begin(I2C_SDA, I2C_SCL);
  lcd.init();
  lcd.backlight();

  lcd.print("Inicializando...");

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  setupI2S();

  // Inicializa SD
  if (!SD.begin(SD_CS)) {
    lcd.clear();
    lcd.print("Erro SD!");
    while (true);
  }

  // Conecta WiFi + MQTT
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);

  lcd.clear();
  lcd.print("Pronto!");
}

// ======================================================================
// ------------------------------- LOOP ---------------------------------
// ======================================================================
void loop() {
  if (!client.connected()) reconnectMQTT();
  client.loop();

  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(1000); // evita ruído do clique

    recordToSD(filename, RECORD_TIME_SEC);

    // Lê arquivo para inferir
    File f = SD.open(filename);
    if (!f) {
      lcd.clear();
      lcd.print("Erro arquivo!");
      return;
    }

    const int NUM_READ = 16000;
    static float buffer[NUM_READ];
    int16_t sample;
    int i = 0;

    while (f.available() && i < NUM_READ) {
      f.read((byte*)&sample, sizeof(sample));
      buffer[i++] = sample / 32768.0f;
    }
    f.close();

    signal_t signal;
    numpy::signal_from_buffer(buffer, i, &signal);
    ei_impulse_result_t result;
    EI_IMPULSE_ERROR res = run_classifier(&signal, &result, false);

    if (res != EI_IMPULSE_OK) {
      lcd.clear();
      lcd.print("Erro infer!");
      return;
    }

    float anom = result.classification[0].value;
    float normal = result.classification[1].value;

    bool isAnomalia = anom > normal;

    // ------------------------------
    // Envia INFERÊNCIA via MQTT
    // ------------------------------
    String jsonMsg =
      "{\"label\":\"" + String(isAnomalia ? "anomalous" : "normal") +
      "\",\"score\":" + String(isAnomalia ? anom : normal, 3) +
      "}";

    client.publish("/machine/audio/inference", jsonMsg.c_str());

    // ------------------------------
    // Atualiza LCD
    // ------------------------------
    lcd.clear();
    lcd.print("Resultado:");
    lcd.setCursor(0, 1);
    lcd.print(isAnomalia ? "Anomalia" : "Normal");

    Serial.println(jsonMsg);
  }
}
