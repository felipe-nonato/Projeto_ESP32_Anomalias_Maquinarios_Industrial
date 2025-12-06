const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const {
  insertReading,
  getRecentReadings,
  getReadingsByPeriod,
  getStats,
  getDeviceStats
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração MQTT
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || '/machine/audio/inference';

let mqttClient = null;
let connectionStatus = 'disconnected';

// Conectar ao MQTT Broker
function connectMQTT() {
  console.log(`🔌 Connecting to MQTT broker: ${MQTT_BROKER}`);
  
  mqttClient = mqtt.connect(MQTT_BROKER, {
    clean: true,
    reconnectPeriod: 5000,
  });

  mqttClient.on('connect', () => {
    console.log('✅ Connected to MQTT broker');
    connectionStatus = 'connected';
    
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error('❌ Error subscribing to topic:', err);
        connectionStatus = 'error';
      } else {
        console.log(`📡 Subscribed to topic: ${MQTT_TOPIC}`);
      }
    });
  });

  mqttClient.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      console.log('📨 Received MQTT message:', payload);

      // Determinar status e severidade
      const isAnomalous = payload.label === 'anomalous';
      const score = payload.score;
      
      let status = 'normal';
      let severity = 'low';
      
      if (isAnomalous) {
        if (score > 0.8) {
          status = 'critical';
          severity = 'high';
        } else if (score > 0.5) {
          status = 'warning';
          severity = 'medium';
        } else {
          status = 'normal';
          severity = 'low';
        }
      }

      // Salvar no banco de dados
      const data = {
        device_id: payload.device_id || 'ESP32_Anomalia',
        label: payload.label,
        score: payload.score,
        status: status,
        severity: severity
      };

      const id = await insertReading(data);
      console.log(`💾 Saved to database with ID: ${id}`);

      // Broadcast para clientes WebSocket (se implementado)
      io && io.emit('new-reading', { id, ...data, timestamp: new Date() });

    } catch (error) {
      console.error('❌ Error processing MQTT message:', error);
    }
  });

  mqttClient.on('error', (err) => {
    console.error('❌ MQTT Error:', err);
    connectionStatus = 'error';
  });

  mqttClient.on('disconnect', () => {
    console.log('🔌 Disconnected from MQTT broker');
    connectionStatus = 'disconnected';
  });

  mqttClient.on('reconnect', () => {
    console.log('🔄 Reconnecting to MQTT broker...');
    connectionStatus = 'reconnecting';
  });
}

// Iniciar conexão MQTT
connectMQTT();

// ==================== REST API ENDPOINTS ====================

/**
 * GET /api/health
 * Verificar status do servidor
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mqtt: connectionStatus,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/readings
 * Buscar últimas leituras
 */
app.get('/api/readings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const readings = await getRecentReadings(limit);
    res.json({
      success: true,
      count: readings.length,
      data: readings
    });
  } catch (error) {
    console.error('Error fetching readings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/readings/period
 * Buscar leituras por período
 */
app.get('/api/readings/period', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: 'start and end date parameters are required'
      });
    }

    const readings = await getReadingsByPeriod(start, end);
    res.json({
      success: true,
      count: readings.length,
      data: readings
    });
  } catch (error) {
    console.error('Error fetching readings by period:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/stats
 * Buscar estatísticas gerais (últimas 24h)
 */
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/stats/devices
 * Buscar estatísticas por dispositivo
 */
app.get('/api/stats/devices', async (req, res) => {
  try {
    const stats = await getDeviceStats();
    res.json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching device stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/readings
 * Inserir nova leitura manualmente (para testes)
 */
app.post('/api/readings', async (req, res) => {
  try {
    const { device_id, label, score } = req.body;

    if (!device_id || !label || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'device_id, label, and score are required'
      });
    }

    // Determinar status
    const isAnomalous = label === 'anomalous';
    let status = 'normal';
    let severity = 'low';
    
    if (isAnomalous) {
      if (score > 0.8) {
        status = 'critical';
        severity = 'high';
      } else if (score > 0.5) {
        status = 'warning';
        severity = 'medium';
      }
    }

    const data = {
      device_id,
      label,
      score,
      status,
      severity
    };

    const id = await insertReading(data);
    
    res.status(201).json({
      success: true,
      id: id,
      data: data
    });
  } catch (error) {
    console.error('Error inserting reading:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== WebSocket (Socket.io) ====================
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected via WebSocket:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ==================== START SERVER ====================

server.listen(PORT, () => {
  console.log('');
  console.log('================================================');
  console.log('🚀 ESP32 Anomaly Detection API Server');
  console.log('================================================');
  console.log(`📡 HTTP Server running on: http://localhost:${PORT}`);
  console.log(`📡 WebSocket Server running on: ws://localhost:${PORT}`);
  console.log(`🔌 MQTT Broker: ${MQTT_BROKER}`);
  console.log(`📢 MQTT Topic: ${MQTT_TOPIC}`);
  console.log('================================================');
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log(`  GET  /api/health              - Server health check`);
  console.log(`  GET  /api/readings            - Get recent readings`);
  console.log(`  GET  /api/readings/period     - Get readings by date range`);
  console.log(`  GET  /api/stats               - Get general statistics`);
  console.log(`  GET  /api/stats/devices       - Get device statistics`);
  console.log(`  POST /api/readings            - Add new reading`);
  console.log('================================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (mqttClient) {
    mqttClient.end();
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
