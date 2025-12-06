const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Criar banco de dados
const dbPath = path.join(__dirname, 'anomalies.db');
const db = new sqlite3.Database(dbPath);

// Inicializar tabelas
db.serialize(() => {
  // Tabela de leituras
  db.run(`
    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      label TEXT NOT NULL,
      score REAL NOT NULL,
      status TEXT NOT NULL,
      severity TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de estatísticas agregadas
  db.run(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      total_readings INTEGER DEFAULT 0,
      normal_count INTEGER DEFAULT 0,
      warning_count INTEGER DEFAULT 0,
      critical_count INTEGER DEFAULT 0,
      avg_score REAL DEFAULT 0,
      UNIQUE(date)
    )
  `);

  // Índices para melhor performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON readings(timestamp DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_status ON readings(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_device ON readings(device_id)`);
  
  console.log('✅ Database initialized successfully');
});

// Funções auxiliares

/**
 * Inserir nova leitura
 */
function insertReading(data) {
  return new Promise((resolve, reject) => {
    const { device_id, label, score, status, severity } = data;
    
    db.run(
      `INSERT INTO readings (device_id, label, score, status, severity) 
       VALUES (?, ?, ?, ?, ?)`,
      [device_id, label, score, status, severity],
      function(err) {
        if (err) {
          reject(err);
        } else {
          // Atualizar estatísticas diárias
          updateDailyStats();
          resolve(this.lastID);
        }
      }
    );
  });
}

/**
 * Buscar últimas leituras
 */
function getRecentReadings(limit = 50) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM readings 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

/**
 * Buscar leituras por período
 */
function getReadingsByPeriod(startDate, endDate) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM readings 
       WHERE timestamp BETWEEN ? AND ?
       ORDER BY timestamp DESC`,
      [startDate, endDate],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

/**
 * Buscar estatísticas gerais
 */
function getStats() {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'normal' THEN 1 ELSE 0 END) as normal,
        SUM(CASE WHEN status = 'warning' THEN 1 ELSE 0 END) as warning,
        SUM(CASE WHEN status = 'critical' THEN 1 ELSE 0 END) as critical,
        AVG(score) as avg_score,
        MAX(timestamp) as last_update
       FROM readings
       WHERE timestamp >= datetime('now', '-24 hours')`,
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

/**
 * Buscar estatísticas por dispositivo
 */
function getDeviceStats() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        device_id,
        COUNT(*) as total_readings,
        SUM(CASE WHEN status = 'critical' THEN 1 ELSE 0 END) as critical_count,
        SUM(CASE WHEN status = 'warning' THEN 1 ELSE 0 END) as warning_count,
        AVG(score) as avg_score,
        MAX(timestamp) as last_seen
       FROM readings
       WHERE timestamp >= datetime('now', '-24 hours')
       GROUP BY device_id`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

/**
 * Atualizar estatísticas diárias
 */
function updateDailyStats() {
  const today = new Date().toISOString().split('T')[0];
  
  db.run(
    `INSERT INTO daily_stats (date, total_readings, normal_count, warning_count, critical_count, avg_score)
     SELECT 
       DATE(timestamp) as date,
       COUNT(*) as total_readings,
       SUM(CASE WHEN status = 'normal' THEN 1 ELSE 0 END) as normal_count,
       SUM(CASE WHEN status = 'warning' THEN 1 ELSE 0 END) as warning_count,
       SUM(CASE WHEN status = 'critical' THEN 1 ELSE 0 END) as critical_count,
       AVG(score) as avg_score
     FROM readings
     WHERE DATE(timestamp) = ?
     ON CONFLICT(date) DO UPDATE SET
       total_readings = excluded.total_readings,
       normal_count = excluded.normal_count,
       warning_count = excluded.warning_count,
       critical_count = excluded.critical_count,
       avg_score = excluded.avg_score`,
    [today]
  );
}

/**
 * Limpar dados antigos (manter últimos 30 dias)
 */
function cleanOldData() {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM readings 
       WHERE timestamp < datetime('now', '-30 days')`,
      function(err) {
        if (err) reject(err);
        else {
          console.log(`🗑️  Removed ${this.changes} old records`);
          resolve(this.changes);
        }
      }
    );
  });
}

// Executar limpeza diária
setInterval(() => {
  cleanOldData().catch(console.error);
}, 24 * 60 * 60 * 1000); // A cada 24 horas

module.exports = {
  db,
  insertReading,
  getRecentReadings,
  getReadingsByPeriod,
  getStats,
  getDeviceStats,
  cleanOldData
};
