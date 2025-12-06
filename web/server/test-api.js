#!/usr/bin/env node

/**
 * Script para testar a API do servidor Express
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Função helper para fazer requisições
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Testes
async function runTests() {
  console.log('🧪 Testing ESP32 Anomaly Detection API\n');
  console.log('='.repeat(50));

  try {
    // Teste 1: Health Check
    console.log('\n1️⃣  Testing Health Check...');
    const health = await makeRequest('/api/health');
    console.log('   Status:', health.status);
    console.log('   Response:', JSON.stringify(health.data, null, 2));

    // Teste 2: Inserir leitura normal
    console.log('\n2️⃣  Inserting Normal Reading...');
    const normalReading = await makeRequest('/api/readings', 'POST', {
      device_id: 'TEST_ESP32',
      label: 'normal',
      score: 0.95
    });
    console.log('   Status:', normalReading.status);
    console.log('   Response:', JSON.stringify(normalReading.data, null, 2));

    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 500));

    // Teste 3: Inserir leitura com warning
    console.log('\n3️⃣  Inserting Warning Reading...');
    const warningReading = await makeRequest('/api/readings', 'POST', {
      device_id: 'TEST_ESP32',
      label: 'anomalous',
      score: 0.65
    });
    console.log('   Status:', warningReading.status);
    console.log('   Response:', JSON.stringify(warningReading.data, null, 2));

    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 500));

    // Teste 4: Inserir leitura crítica
    console.log('\n4️⃣  Inserting Critical Reading...');
    const criticalReading = await makeRequest('/api/readings', 'POST', {
      device_id: 'TEST_ESP32',
      label: 'anomalous',
      score: 0.92
    });
    console.log('   Status:', criticalReading.status);
    console.log('   Response:', JSON.stringify(criticalReading.data, null, 2));

    // Teste 5: Buscar últimas leituras
    console.log('\n5️⃣  Fetching Recent Readings...');
    const readings = await makeRequest('/api/readings?limit=5');
    console.log('   Status:', readings.status);
    console.log('   Count:', readings.data.count);
    console.log('   Sample:', JSON.stringify(readings.data.data[0], null, 2));

    // Teste 6: Buscar estatísticas
    console.log('\n6️⃣  Fetching Statistics...');
    const stats = await makeRequest('/api/stats');
    console.log('   Status:', stats.status);
    console.log('   Response:', JSON.stringify(stats.data, null, 2));

    // Teste 7: Estatísticas por dispositivo
    console.log('\n7️⃣  Fetching Device Statistics...');
    const deviceStats = await makeRequest('/api/stats/devices');
    console.log('   Status:', deviceStats.status);
    console.log('   Devices:', deviceStats.data.count);
    if (deviceStats.data.data.length > 0) {
      console.log('   Sample:', JSON.stringify(deviceStats.data.data[0], null, 2));
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar testes
runTests();
