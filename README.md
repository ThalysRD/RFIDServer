# RFID Server API

API para recebimento e processamento de leituras RFID.

## Rotas da API

### 1. Health Check

```
GET /api/health
```

**Resposta:**

```json
{
  "status": "OK",
  "timestamp": "2024-08-21T15:30:00.000Z",
  "uptime": 3600.123
}
```

### 2. Criar Leitura RFID

**Leitura Individual:**

```
POST /api/rfid/reading
Content-Type: application/json
```

**Body:**

```json
{
  "tagId": "ABC123456789",
  "employeeName": "João Silva",
  "timestampReading": "2024-08-21T08:15:30.000Z",
  "rssi": -45,
  "location": "Entrada Principal",
  "deviceId": "ESP32_01"
}
```

**Múltiplas Leituras (Array):**

```json
[
  {
    "tagId": "ABC123456789",
    "employeeName": "João Silva",
    "timestampReading": "2024-08-21T08:15:30.000Z",
    "rssi": -45,
    "location": "Entrada Principal",
    "deviceId": "ESP32_01"
  },
  {
    "tagId": "DEF987654321",
    "employeeName": "Maria Santos",
    "timestampReading": "2024-08-21T08:16:00.000Z",
    "rssi": -52,
    "location": "Refeitório",
    "deviceId": "ESP32_02"
  }
]
```

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Leitura RFID recebida e salva",
  "data": {
    "id": 1,
    "tagId": "ABC123456789",
    "employeeName": "João Silva",
    "timestampReading": "2024-08-21T08:15:30.000Z",
    "createdAt": "2024-08-21T08:15:31.123Z"
  }
}
```

### 3. Consultar Todas as Leituras

```
GET /api/rfid/readings?limit=50&offset=0
```

**Resposta:**

```json
{
  "success": true,
  "readings": [
    {
      "id": 1,
      "tag_id": "ABC123456789",
      "employee_name": "João Silva",
      "timestamp_reading": "2024-08-21T08:15:30.000Z",
      "rssi": -45,
      "location": "Entrada Principal",
      "device_id": "ESP32_01",
      "created_at": "2024-08-21T08:15:31.123Z"
    }
  ],
  "total": 1,
  "pagination": {
    "limit": 50,
    "offset": 0
  }
}
```

### 4. Consultar Leituras por Tag

```
GET /api/rfid/readings/tag/{tagId}?limit=20
```

**Exemplo:**

```
GET /api/rfid/readings/tag/ABC123456789?limit=10
```

### 5. Consultar Leituras por Funcionário

```
GET /api/rfid/readings/employee/{employeeName}?limit=20
```

**Exemplo:**

```
GET /api/rfid/readings/employee/João Silva?limit=10
```

### 6. Consultar Leituras por Período

```
GET /api/rfid/readings/date-range?startDate=2024-08-21T00:00:00Z&endDate=2024-08-21T23:59:59Z&limit=50
```

## Como Usar

### Campos Obrigatórios

- `tagId`: ID único do cartão RFID
- `employeeName`: Nome do funcionário
- `timestampReading`: Timestamp da leitura (formato ISO 8601)

### Campos Opcionais

- `rssi`: Força do sinal (número negativo)
- `location`: Local da leitura
- `deviceId`: ID do dispositivo ESP32

### Exemplo com cURL

**Criar uma leitura:**

```bash
curl -X POST https://your-api.vercel.app/api/rfid/reading \
  -H "Content-Type: application/json" \
  -d '{
    "tagId": "TEST001",
    "employeeName": "João Silva",
    "timestampReading": "2024-08-21T15:30:00.000Z",
    "rssi": -45,
    "location": "Entrada Principal",
    "deviceId": "ESP32_01"
  }'
```

**Consultar leituras:**

```bash
curl https://your-api.vercel.app/api/rfid/readings?limit=10
```

### Exemplo com JavaScript

```javascript
// Criar leitura
const response = await fetch("https://your-api.vercel.app/api/rfid/reading", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tagId: "TEST001",
    employeeName: "João Silva",
    timestampReading: new Date().toISOString(),
    rssi: -45,
    location: "Entrada Principal",
    deviceId: "ESP32_01",
  }),
});

const data = await response.json();
console.log(data);
```

### Respostas de Erro

**400 - Bad Request:**

```json
{
  "success": false,
  "error": "tagId é obrigatório"
}
```

**500 - Internal Server Error:**

```json
{
  "success": false,
  "error": "Erro interno do servidor",
  "message": "Detalhes do erro"
}
```

```json
{
  "status": "OK",
  "timestamp": "2024-08-21T15:30:00.000Z",
  "uptime": 3600.123
}
```

### Criar Leitura RFID

**Leitura Individual:**

```
POST /api/rfid/reading
Content-Type: application/json
```

**Body:**

```json
{
  "tagId": "ABC123456789",
  "employeeName": "João Silva",
  "timestampReading": "2024-08-21T08:15:30.000Z",
  "rssi": -45,
  "location": "Entrada Principal",
  "deviceId": "ESP32_01"
}
```

**Múltiplas Leituras (Batch):**

```json
[
  {
    "tagId": "ABC123456789",
    "employeeName": "João Silva",
    "timestampReading": "2024-08-21T08:15:30.000Z",
    "rssi": -45,
    "location": "Entrada Principal",
    "deviceId": "ESP32_01"
  },
  {
    "tagId": "DEF987654321",
    "employeeName": "Maria Santos",
    "timestampReading": "2024-08-21T08:16:00.000Z",
    "rssi": -52,
    "location": "Entrada Principal",
    "deviceId": "ESP32_01"
  }
]
```

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Leitura RFID recebida e salva",
  "data": {
    "id": 1,
    "tagId": "ABC123456789",
    "employeeName": "João Silva",
    "timestampReading": "2024-08-21T08:15:30.000Z",
    "createdAt": "2024-08-21T08:15:31.123Z"
  }
}
```

### Consultar Leituras

**Todas as leituras:**

```
GET /api/rfid/readings?limit=50&offset=0
```

**Por Tag:**

```
GET /api/rfid/readings/tag/{tagId}?limit=20
```

**Por Funcionário:**

```
GET /api/rfid/readings/employee/{employeeName}?limit=20
```

**Por Período:**

```
GET /api/rfid/readings/date-range?startDate=2024-08-21T00:00:00Z&endDate=2024-08-21T23:59:59Z&limit=50
```

## Testando com Postman

### 1. Configuração do Postman

1. Abra o Postman
2. Crie uma nova Collection chamada "RFID Server API"
3. Configure a Base URL como sua URL do Vercel: `https://your-app.vercel.app`

### 2. Requests Essenciais

#### Health Check

- **Method:** GET
- **URL:** `{{baseUrl}}/api/health`
- **Headers:** Nenhum necessário

#### Criar Leitura Individual

- **Method:** POST
- **URL:** `{{baseUrl}}/api/rfid/reading`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**

```json
{
  "tagId": "TEST001",
  "employeeName": "João Silva",
  "timestampReading": "2024-08-21T15:30:00.000Z",
  "rssi": -45,
  "location": "Entrada Principal",
  "deviceId": "ESP32_01"
}
```

#### Criar Múltiplas Leituras

- **Method:** POST
- **URL:** `{{baseUrl}}/api/rfid/reading`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**

```json
[
  {
    "tagId": "TEST001",
    "employeeName": "João Silva",
    "timestampReading": "2024-08-21T15:30:00.000Z",
    "rssi": -45,
    "location": "Entrada Principal",
    "deviceId": "ESP32_01"
  },
  {
    "tagId": "TEST002",
    "employeeName": "Maria Santos",
    "timestampReading": "2024-08-21T15:31:00.000Z",
    "rssi": -48,
    "location": "Entrada Principal",
    "deviceId": "ESP32_01"
  }
]
```

#### Consultar Leituras

- **Method:** GET
- **URL:** `{{baseUrl}}/api/rfid/readings`
- **Query Params:**
  - `limit: 10`
  - `offset: 0`

#### Consultar por Tag

- **Method:** GET
- **URL:** `{{baseUrl}}/api/rfid/readings/tag/TEST001`
- **Query Params:**
  - `limit: 20`

#### Consultar por Funcionário

- **Method:** GET
- **URL:** `{{baseUrl}}/api/rfid/readings/employee/João Silva`
- **Query Params:**
  - `limit: 20`

#### Consultar por Período

- **Method:** GET
- **URL:** `{{baseUrl}}/api/rfid/readings/date-range`
- **Query Params:**
  - `startDate: 2024-08-21T00:00:00Z`
  - `endDate: 2024-08-21T23:59:59Z`
  - `limit: 50`

### 3. Variáveis no Postman

Configure uma variável de ambiente no Postman:

- **Variable:** `baseUrl`
- **Value:** `https://your-vercel-app.vercel.app`

## Estrutura do Banco de Dados

A API cria automaticamente a seguinte tabela:

```sql
CREATE TABLE rfid_readings (
    id SERIAL PRIMARY KEY,
    tag_id VARCHAR(255) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    timestamp_reading TIMESTAMP WITH TIME ZONE NOT NULL,
    rssi INTEGER,
    location VARCHAR(255),
    device_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Campos Obrigatórios

- `tagId`: ID único do cartão RFID
- `employeeName`: Nome do funcionário
- `timestampReading`: Timestamp da leitura (formato ISO 8601)

## Campos Opcionais

- `rssi`: Força do sinal (número negativo)
- `location`: Local da leitura
- `deviceId`: ID do dispositivo ESP32

## Respostas de Erro

### 400 - Bad Request

```json
{
  "success": false,
  "error": "tagId é obrigatório",
  "receivedData": { ... }
}
```

### 500 - Internal Server Error

```json
{
  "success": false,
  "error": "Erro interno do servidor",
  "message": "Detalhes do erro"
}
```

## Exemplo de Uso com ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA_WIFI";
const char* serverURL = "https://your-vercel-app.vercel.app/api/rfid/reading";

void sendRFIDReading(String tagId, String employeeName) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument doc(1024);
    doc["tagId"] = tagId;
    doc["employeeName"] = employeeName;
    doc["timestampReading"] = "2024-08-21T15:30:00.000Z";
    doc["rssi"] = WiFi.RSSI();
    doc["location"] = "Entrada Principal";
    doc["deviceId"] = "ESP32_01";

    String jsonString;
    serializeJson(doc, jsonString);

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Resposta: " + response);
    }

    http.end();
  }
}
```
