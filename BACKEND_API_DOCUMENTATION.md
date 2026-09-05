# 🚢 SIH26006 — Backend API Documentation for Frontend Developers

### **National Maritime Freight Intelligence System (NMFIS)**
### *Ministry of Steel, Government of India — Bulk Cargo Procurement Optimization*

> **Document Version:** 1.0.0  
> **API Framework:** FastAPI (Python)  
> **Backend Base URL:** `http://localhost:8000`  
> **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)  
> **ReDoc Alternative:** [http://localhost:8000/redoc](http://localhost:8000/redoc)  
> **Last Updated:** September 2026

---

## 📑 Table of Contents

1. [Quick Start for Frontend Developers](#1-quick-start-for-frontend-developers)
2. [API Architecture Overview](#2-api-architecture-overview)
3. [CORS & Connection Setup](#3-cors--connection-setup)
4. [Static Assets & File Serving](#4-static-assets--file-serving)
5. [Complete Endpoint Reference](#5-complete-endpoint-reference)
   - 5.1 [System Endpoints](#51-system-endpoints)
   - 5.2 [Forecasting Endpoints](#52-forecasting-endpoints)
   - 5.3 [Decision Support & Explainability Endpoints](#53-decision-support--explainability-endpoints)
   - 5.4 [Market Intelligence Endpoints](#54-market-intelligence-endpoints)
   - 5.5 [Maritime AI Chatbot Endpoints](#55-maritime-ai-chatbot-endpoints)
6. [Complete Schema Reference (TypeScript)](#6-complete-schema-reference-typescript)
7. [Business Logic & Decision Rules](#7-business-logic--decision-rules)
8. [Error Handling Guide](#8-error-handling-guide)
9. [Frontend Page & Component Mapping](#9-frontend-page--component-mapping)
10. [Color System & Design Tokens](#10-color-system--design-tokens)
11. [Sample API Call Flows](#11-sample-api-call-flows)
12. [Glossary of Domain Terms](#12-glossary-of-domain-terms)

---

## 1. Quick Start for Frontend Developers

### Starting the Backend Server

```powershell
# From project root (SIH26002/)
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run_api.py
```

The server starts at **`http://localhost:8000`** with hot-reload enabled.

### Your First API Calls (JavaScript)

```javascript
// 1. Health Check
const health = await fetch('http://localhost:8000/health').then(r => r.json());
console.log(health.status); // "healthy"

// 2. Get Market Snapshot
const market = await fetch('http://localhost:8000/api/v1/market/snapshot').then(r => r.json());
console.log(market.bci_index); // e.g. 1001.4

// 3. Run a Forecast
const forecast = await fetch('http://localhost:8000/api/v1/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    horizon_days: 7,
    route: "C5",
    scenario_overrides: null
  })
}).then(r => r.json());
console.log(forecast.recommendation.action); // "CHARTER_NOW" | "WAIT" | "HOLD_NEUTRAL"
```

---

## 2. API Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        FastAPI Application                       │
│                  (api/main.py — CORS Enabled)                    │
├──────────┬──────────────┬───────────────┬────────────────────────┤
│  System  │  Forecasting │  Decision &   │  Maritime AI Chatbot   │
│          │              │  Explainability│                        │
├──────────┼──────────────┼───────────────┼────────────────────────┤
│ /health  │ POST /predict│ GET /recommend│ POST /chat             │
│ /api/info│              │ GET /explain  │ GET  /chat/suggestions  │
├──────────┴──────────────┴───────────────┴────────────────────────┤
│  Market Intelligence: GET /market/snapshot, GET /market/history   │
├──────────────────────────────────────────────────────────────────┤
│                    ForecasterService (Singleton)                  │
│              XGBoost Model + BiLSTM + Hybrid Ensemble            │
├──────────────────────────────────────────────────────────────────┤
│                    ChatService (Singleton)                        │
│        Glossary Engine + Decision Support + Savings Calculator    │
└──────────────────────────────────────────────────────────────────┘
```

### Router Prefixes

| Module | Router Prefix | Tag |
|---|---|---|
| Predict | `/api/v1` | Forecasting |
| Explainability | `/api/v1` | Decision Support & Explainability |
| Market | `/api/v1/market` | Market Intelligence |
| Chat | `/api/v1/chat` | Maritime AI Assistant & Decision Support |
| System | `/` (root) | System |

---

## 3. CORS & Connection Setup

The backend has **fully open CORS** configured — you can call it from any frontend origin during development:

```python
# Already configured in api/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # All origins allowed
    allow_credentials=True,
    allow_methods=["*"],           # All HTTP methods
    allow_headers=["*"],           # All headers
)
```

### Frontend Fetch Configuration

```javascript
const API_BASE = 'http://localhost:8000';

// For GET requests
async function apiGet(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

// For POST requests
async function apiPost(endpoint, body) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}
```

---

## 4. Static Assets & File Serving

### SHAP Explainability Charts

The backend serves SHAP visualization plots as static files:

| Asset | URL | Description |
|---|---|---|
| SHAP Summary Plot | `GET /reports/shap_summary.png` | Bar chart of top feature importances |
| SHAP Waterfall Plot | `GET /reports/shap_latest_waterfall.png` | Waterfall breakdown of latest prediction |

**Usage in Frontend:**
```html
<img src="http://localhost:8000/reports/shap_summary.png" alt="SHAP Feature Importance" />
<img src="http://localhost:8000/reports/shap_latest_waterfall.png" alt="SHAP Waterfall" />
```

### Web Dashboard (Test Interface)

| URL | Serves |
|---|---|
| `GET /` | `test_interface/index.html` (existing dashboard) |
| `GET /test` | Same file (alias) |

> **Note:** The test interface is disposable. Your new frontend will replace it.

---

## 5. Complete Endpoint Reference

---

### 5.1 System Endpoints

---

#### `GET /health`

**Purpose:** Health check to verify the server and ML model are running.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/health` |
| **Auth** | None |
| **Rate Limit** | None |
| **Tag** | System |

**Response Schema:** `HealthResponse`

**Example Response:**
```json
{
  "status": "healthy",
  "service": "SIH26006_Maritime_Freight_Forecaster",
  "version": "1.0.0",
  "model_loaded": true,
  "models_available": ["XGBoost", "BiLSTM", "Hybrid_Ensemble"],
  "model_test_mape": "13.76%"
}
```

**Frontend Usage:**
- Call on app startup to show a green/red connection indicator
- Poll every 30-60 seconds for a live status badge
- Display `models_available` in an "About" or "System Info" panel

---

#### `GET /api/info`

**Purpose:** Returns a summary of the API system and all available endpoint paths.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/info` |
| **Auth** | None |
| **Tag** | System |

**Example Response:**
```json
{
  "system": "SIH26006 Intelligent Freight Forecasting API",
  "beneficiary": "Ministry of Steel, Government of India",
  "documentation": "/docs",
  "endpoints": {
    "predict": "POST /api/v1/predict",
    "chartering_recommendation": "GET /api/v1/recommendation",
    "shap_explainability": "GET /api/v1/explainability",
    "market_snapshot": "GET /api/v1/market/snapshot",
    "market_history": "GET /api/v1/market/history?limit=90",
    "health": "GET /health"
  }
}
```

---

### 5.2 Forecasting Endpoints

---

#### `POST /api/v1/predict`

**Purpose:** The **core prediction endpoint**. Generates AI freight rate forecasts with procurement recommendations. Supports What-If scenario overrides.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/predict` |
| **Content-Type** | `application/json` |
| **Auth** | None |
| **Tag** | Forecasting |

**Request Body:**

| Field | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|
| `horizon_days` | `integer` | No | `7` | `1 <= value <= 30` | Forecast window in business days. Typical values: `1`, `7`, `14`, `30` |
| `route` | `string` | No | `"C5"` | `"BCI"`, `"C5"`, or `"C3"` | Target freight benchmark to predict |
| `scenario_overrides` | `MarketOverride or null` | No | `null` | See below | What-If scenario parameter overrides |

**`scenario_overrides` (MarketOverride) Fields:**

| Field | Type | Unit | Description |
|---|---|---|---|
| `iron_ore_price_usd` | `float or null` | $/tonne | Custom Iron Ore price |
| `brent_crude_usd` | `float or null` | $/barrel | Custom Brent Crude price |
| `port_congestion_east_india_days` | `float or null` | Days | Custom Paradip/Vizag port wait days |
| `bunker_fuel_vlsfo_usd` | `float or null` | $/tonne | Custom VLSFO Bunker Fuel price |
| `china_manufacturing_pmi` | `float or null` | Index | Custom China Manufacturing PMI |

> **Frontend Tip:** Only include fields in `scenario_overrides` that the user explicitly changes. Use `null` or omit fields to use actual market values.

**Example Request (Basic):**
```json
{
  "horizon_days": 7,
  "route": "C5"
}
```

**Example Request (With What-If Scenario):**
```json
{
  "horizon_days": 14,
  "route": "C5",
  "scenario_overrides": {
    "iron_ore_price_usd": 135.0,
    "port_congestion_east_india_days": 8.5,
    "bunker_fuel_vlsfo_usd": 720.0
  }
}
```

**Example Response:**
```json
{
  "status": "success",
  "date_evaluated": "2024-07-19",
  "target_metric": "Route C5 Freight (USD / Metric Tonne)",
  "current_spot_rate": 12.85,
  "predicted_rate": 13.35,
  "expected_change_pct": 3.89,
  "confidence_interval_95pct": {
    "lower": 11.68,
    "upper": 15.02
  },
  "recommendation": {
    "action": "HOLD_NEUTRAL",
    "urgency": "LOW",
    "color": "gray",
    "rationale": "Freight rates expected to stay range-bound (+3.9% change). Standard procurement cadence recommended.",
    "expected_change_pct": 3.89
  },
  "route_details": {
    "route_c5_usd_tonne": 13.35,
    "route_c3_usd_tonne": 28.47,
    "capesize_bci_points": 1399.5,
    "horizon_days": 7
  }
}
```

**Key Response Fields for Frontend:**

| Field | UI Mapping | Notes |
|---|---|---|
| `current_spot_rate` | "Current Rate" display | Show with 2 decimal places |
| `predicted_rate` | "AI Forecast" headline number | Large hero number |
| `expected_change_pct` | Change badge (up/down with color) | Green if positive, Red if negative |
| `confidence_interval_95pct.lower/upper` | Safety band display | Show as `[$12.10 - $15.02]` |
| `recommendation.action` | Decision badge | `CHARTER_NOW` / `WAIT` / `HOLD_NEUTRAL` |
| `recommendation.color` | Badge color | `"green"`, `"red"`, or `"gray"` |
| `recommendation.urgency` | Urgency indicator | `"HIGH"`, `"MEDIUM"`, or `"LOW"` |
| `recommendation.rationale` | Plain-English explanation | Display verbatim in a rationale box |
| `route_details` | Expandable "All Routes" panel | Shows all routes regardless of selected target |

**How to Calculate Savings (Frontend):**
```javascript
const diffPerTonne = Math.abs(response.predicted_rate - response.current_spot_rate);
const cargoTonnes = 170000; // user input or default
const savingsUSD = diffPerTonne * cargoTonnes;
const savingsINR_Cr = (savingsUSD * 83.5) / 10000000;  // 1 Crore = 10,000,000
```

---

### 5.3 Decision Support & Explainability Endpoints

---

#### `GET /api/v1/recommendation`

**Purpose:** Returns only the automated chartering decision (lightweight version of explainability).

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/recommendation` |
| **Auth** | None |
| **Tag** | Decision Support & Explainability |

**Example Response:**
```json
{
  "action": "CHARTER_NOW",
  "urgency": "HIGH",
  "color": "green",
  "rationale": "Freight rates projected to surge by +39.8% over the next 7 days. Early chartering locks in lower freight and avoids demurrage.",
  "expected_change_pct": 39.75
}
```

**Frontend Usage:**
- Use as a **persistent banner** or **status card** on the dashboard
- Color-code the badge: green = `CHARTER_NOW`, red = `WAIT`, gray = `HOLD_NEUTRAL`

---

#### `GET /api/v1/explainability`

**Purpose:** Returns the **full SHAP executive briefing** — why the AI made its prediction, with bullish/bearish driver breakdowns and SHAP chart URLs.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/explainability` |
| **Auth** | None |
| **Tag** | Decision Support & Explainability |

**Example Response:**
```json
{
  "latest_date": "2024-07-19",
  "current_spot_bci": 1001.4,
  "forecast_7d_bci": 1399.50,
  "net_rate_change": -1879.5,
  "procurement_decision": {
    "action": "CHARTER_NOW",
    "urgency": "HIGH",
    "color": "green",
    "rationale": "Freight rates projected to surge by +39.8% over the next 7 days...",
    "expected_change_pct": 39.75
  },
  "bullish_drivers_raising_freight": [
    { "feature": "bci_ma_60", "current_value": 1203.75, "shap_impact": 74.88 },
    { "feature": "cos_day_of_year", "current_value": -0.95, "shap_impact": 72.67 },
    { "feature": "bdi_lag_30", "current_value": 1129.1, "shap_impact": 27.45 }
  ],
  "bearish_drivers_lowering_freight": [
    { "feature": "bci_index", "current_value": 1001.4, "shap_impact": -922.73 },
    { "feature": "bci_ma_7", "current_value": 1020.24, "shap_impact": -368.17 },
    { "feature": "bdi_index", "current_value": 1166.6, "shap_impact": -197.44 }
  ],
  "top_overall_factors": [
    { "feature": "bci_index", "current_value": 1001.4, "shap_impact": -922.73 },
    { "feature": "bci_ma_7", "current_value": 1020.24, "shap_impact": -368.17 },
    { "feature": "bdi_index", "current_value": 1166.6, "shap_impact": -197.44 },
    { "feature": "bci_lag_1", "current_value": 965.1, "shap_impact": -122.38 },
    { "feature": "bci_ma_60", "current_value": 1203.75, "shap_impact": 74.88 },
    { "feature": "cos_day_of_year", "current_value": -0.95, "shap_impact": 72.67 }
  ],
  "summary_chart_url": "/reports/shap_summary.png",
  "waterfall_chart_url": "/reports/shap_latest_waterfall.png"
}
```

**Frontend Component Breakdown:**

| Response Field | Suggested UI Element |
|---|---|
| `procurement_decision` | Decision banner with colored badge |
| `bullish_drivers_raising_freight` | Green bar chart or list (pushing rates up) |
| `bearish_drivers_lowering_freight` | Red bar chart or list (pushing rates down) |
| `top_overall_factors` | Horizontal bar chart (positive green, negative red) |
| `summary_chart_url` | `<img>` tag for SHAP summary |
| `waterfall_chart_url` | `<img>` tag for SHAP waterfall |

**Feature Name to Human-Readable Label Mapping:**

Use this lookup in your frontend to display user-friendly labels:

```javascript
const FEATURE_LABELS = {
  "bci_index":          "Baltic Capesize Index (BCI)",
  "bdi_index":          "Baltic Dry Index (BDI)",
  "bci_ma_7":           "BCI 7-Day Moving Average",
  "bci_ma_14":          "BCI 14-Day Moving Average",
  "bci_ma_30":          "BCI 30-Day Moving Average",
  "bci_ma_60":          "BCI 60-Day Moving Average",
  "bci_std_7":          "BCI 7-Day Volatility",
  "bci_lag_1":          "BCI Yesterday",
  "bci_lag_7":          "BCI 7 Days Ago",
  "bci_lag_14":         "BCI 14 Days Ago",
  "bci_lag_30":         "BCI 30 Days Ago",
  "bdi_lag_1":          "BDI Yesterday",
  "bdi_lag_7":          "BDI 7 Days Ago",
  "bdi_lag_30":         "BDI 30 Days Ago",
  "c5_lag_1":           "Route C5 Yesterday",
  "c5_lag_7":           "Route C5 7 Days Ago",
  "c5_ma_7":            "Route C5 7-Day Average",
  "bci_roc_7":          "BCI 7-Day Rate of Change",
  "bci_roc_14":         "BCI 14-Day Rate of Change",
  "c5_roc_7":           "Route C5 7-Day Rate of Change",
  "iron_ore_price_usd": "Iron Ore Price ($/t)",
  "coking_coal_price_usd": "Coking Coal Price ($/t)",
  "brent_crude_usd":    "Brent Crude Oil ($/bbl)",
  "bunker_fuel_vlsfo_usd": "VLSFO Bunker Fuel ($/t)",
  "china_manufacturing_pmi": "China Manufacturing PMI",
  "sp500_index":        "S&P 500 Index",
  "usd_inr":            "USD / INR Exchange Rate",
  "usd_cny":            "USD / CNY Exchange Rate",
  "port_congestion_east_india_days": "Paradip/Vizag Port Delay (Days)",
  "port_congestion_china_days": "China Port Delay (Days)",
  "capesize_fleet_dwt_m": "Global Capesize Fleet (M DWT)",
  "vessel_orderbook_pct": "Capesize Order Book (%)",
  "cos_day_of_year":    "Seasonal Cycle (Cosine)",
  "sin_day_of_year":    "Seasonal Cycle (Sine)",
  "fuel_to_c5_ratio":   "Fuel-to-Freight Ratio",
  "iron_ore_to_bci_ratio": "Ore-to-Shipping Ratio",
  "bci_to_bdi_ratio":   "Capesize Strength Ratio",
  "is_chinese_new_year": "Chinese New Year Period",
  "is_monsoon_season":  "Indian Monsoon Season",
};
```

---

### 5.4 Market Intelligence Endpoints

---

#### `GET /api/v1/market/snapshot`

**Purpose:** Returns the **latest daily market snapshot** — all key maritime, commodity, and economic indicators.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/market/snapshot` |
| **Auth** | None |
| **Tag** | Market Intelligence |

**Example Response:**
```json
{
  "latest_date": "2024-07-19",
  "bci_index": 1001.4,
  "bdi_index": 1166.6,
  "route_c5_usd_per_tonne": 12.85,
  "route_c3_usd_per_tonne": 27.13,
  "iron_ore_price_usd": 104.42,
  "coking_coal_price_usd": 221.65,
  "brent_crude_usd": 84.91,
  "bunker_fuel_vlsfo_usd": 622.6,
  "port_congestion_east_india_days": 4.7,
  "china_manufacturing_pmi": 49.76,
  "usd_inr": 83.57
}
```

**Frontend Mapping:**

| Response Field | Display Label | Display Format | Icon |
|---|---|---|---|
| `bci_index` | Baltic Capesize Index (BCI) | `1,001.4 pts` | 📊 |
| `bdi_index` | Baltic Dry Index (BDI) | `1,166.6 pts` | 📈 |
| `route_c5_usd_per_tonne` | Route C5 (W. Australia to India) | `$12.85 / tonne` | 🚢 |
| `route_c3_usd_per_tonne` | Route C3 (Brazil to India) | `$27.13 / tonne` | 🚢 |
| `iron_ore_price_usd` | Iron Ore (62% Fe CFR) | `$104.42 / tonne` | ⛏️ |
| `coking_coal_price_usd` | Coking Coal (Premium HCC) | `$221.65 / tonne` | 🪨 |
| `brent_crude_usd` | Brent Crude Oil | `$84.91 / bbl` | 🛢️ |
| `bunker_fuel_vlsfo_usd` | VLSFO Bunker Fuel | `$622.60 / tonne` | ⛽ |
| `port_congestion_east_india_days` | Paradip & Vizag Port Delay | `4.7 days` | ⚓ |
| `china_manufacturing_pmi` | China Manufacturing PMI | `49.76` | 🏭 |
| `usd_inr` | USD / INR Exchange Rate | `Rs. 83.57` | 💱 |

---

#### `GET /api/v1/market/history`

**Purpose:** Returns **historical daily time-series** data for charting and trend visualization.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/market/history` |
| **Auth** | None |
| **Tag** | Market Intelligence |

**Query Parameters:**

| Param | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|
| `limit` | `integer` | No | `90` | `7 <= value <= 365` | Number of most recent trading days to return |

**Example Request:**
```
GET /api/v1/market/history?limit=90
GET /api/v1/market/history?limit=365
```

**Response:** Array of daily records (JSON array)

```json
[
  {
    "date": "2024-04-01",
    "bci_index": 2154.3,
    "bdi_index": 1723.5,
    "route_c5_usd_per_tonne": 11.25,
    "route_c3_usd_per_tonne": 24.67,
    "iron_ore_price_usd": 109.30,
    "bunker_fuel_vlsfo_usd": 605.10,
    "port_congestion_east_india_days": 3.8
  },
  {
    "date": "2024-04-02",
    "bci_index": 2198.7,
    "bdi_index": 1741.2,
    "route_c5_usd_per_tonne": 11.42,
    "route_c3_usd_per_tonne": 24.95,
    "iron_ore_price_usd": 110.15,
    "bunker_fuel_vlsfo_usd": 609.80,
    "port_congestion_east_india_days": 4.1
  }
]
```

**Fields per Record:**

| Field | Type | Unit |
|---|---|---|
| `date` | `string` | `YYYY-MM-DD` |
| `bci_index` | `float` | Index Points |
| `bdi_index` | `float` | Index Points |
| `route_c5_usd_per_tonne` | `float` | $/tonne |
| `route_c3_usd_per_tonne` | `float` | $/tonne |
| `iron_ore_price_usd` | `float` | $/tonne |
| `bunker_fuel_vlsfo_usd` | `float` | $/tonne |
| `port_congestion_east_india_days` | `float` | Days |

**Frontend Usage:**
- **Line Charts:** Plot `bci_index` and/or `route_c5_usd_per_tonne` over `date` using Chart.js, Recharts, or D3.js
- **Multi-Series:** Overlay BCI + C5 + C3 on a dual-axis chart
- **Tooltips:** Show all values for the hovered date
- **Period Selector:** Use different `limit` values for 1W (7), 1M (30), 3M (90), 6M (180), 1Y (365) views

---

### 5.5 Maritime AI Chatbot Endpoints

---

#### `POST /api/v1/chat`

**Purpose:** The **interactive AI Maritime Copilot**. Handles:
- Maritime terminology explanations (BCI, Demurrage, Laytime, etc.)
- Real-time procurement decisions ("Should I charter now or wait?")
- Financial savings calculations for given cargo tonnage
- Port congestion & demurrage risk analysis
- Live market snapshot queries

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/chat` |
| **Content-Type** | `application/json` |
| **Auth** | None |
| **Tag** | Maritime AI Assistant & Decision Support |

**Request Body:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `message` | `string` | **Yes** | — | User's question or query |
| `history` | `ChatMessage[] or null` | No | `[]` | Previous chat turns for context (optional) |
| `cargo_tonnes` | `float or null` | No | `170000.0` | Cargo size in metric tonnes for savings calculations |
| `route` | `string or null` | No | `"C5"` | Route context (`"C5"`, `"C3"`, or `"BCI"`) |

**`history` Array Item (ChatMessage):**

| Field | Type | Description |
|---|---|---|
| `role` | `string` | `"user"` or `"assistant"` |
| `content` | `string` | Message text content |

**Example Request:**
```json
{
  "message": "Should I charter a vessel now or wait 7 days for Route C5?",
  "history": [],
  "cargo_tonnes": 170000,
  "route": "C5"
}
```

**Example Request (With History):**
```json
{
  "message": "How much can the Ministry save by waiting?",
  "history": [
    { "role": "user", "content": "What is Route C5?" },
    { "role": "assistant", "content": "Route C5 is the freight benchmark for..." }
  ],
  "cargo_tonnes": 200000,
  "route": "C5"
}
```

**Example Response:**
```json
{
  "reply": "### Recommended Action: **CHARTER NOW (Book Vessel Immediately)**\n\n| Metric | Spot Rate (Today) | Forecast (In 7 Days) | Expected Change |\n| :--- | :--- | :--- | :--- |\n| **C5 Freight** | **$12.85 $/tonne** | **$13.35 $/tonne** | **+3.9%** |\n\n...",
  "category": "decision_support",
  "action_signal": "CHARTER_NOW",
  "estimated_savings_usd": 85000.00,
  "estimated_savings_inr_cr": 0.71,
  "follow_up_suggestions": [
    "How much will we save if we wait 14 days?",
    "What is the demurrage risk at Paradip port?",
    "Why did the model predict rates will rise?",
    "Explain Route C5"
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `reply` | `string` | **Markdown-formatted** reply (render with a Markdown parser!) |
| `category` | `string` | Response type: `"glossary"`, `"decision_support"`, `"market_insight"`, or `"general"` |
| `action_signal` | `string or null` | Chartering signal if applicable: `"CHARTER_NOW"`, `"WAIT"`, `"HOLD_NEUTRAL"` |
| `estimated_savings_usd` | `float or null` | Total voyage savings in USD (null if not applicable) |
| `estimated_savings_inr_cr` | `float or null` | Savings in Indian Crores (null if not applicable) |
| `follow_up_suggestions` | `string[]` | Array of suggested next questions (render as clickable pills/buttons) |

> **IMPORTANT:** The `reply` field contains **Markdown** with headers (`###`), tables, bold text, math notation, and emojis. You **MUST** render it using a Markdown parser (e.g., `marked.js`, `react-markdown`, `markdown-it`).

---

#### `GET /api/v1/chat/suggestions`

**Purpose:** Returns pre-built suggestion prompts organized by category for the chat interface.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/chat/suggestions` |
| **Auth** | None |
| **Tag** | Maritime AI Assistant & Decision Support |

**Example Response:**
```json
{
  "categories": [
    {
      "group": "Terminology & Concepts",
      "prompts": [
        "What is Baltic Capesize Index (BCI)?",
        "What is Route C5 vs Route C3?",
        "What is Demurrage and how is it calculated?",
        "What is Laytime and Despatch?",
        "What is VLSFO bunker fuel?",
        "What is CFR vs FOB shipping?",
        "What are SHAP values?"
      ]
    },
    {
      "group": "Procurement Decision Support",
      "prompts": [
        "Should I charter a vessel now or wait 7 days for Route C5?",
        "How much can the Ministry save by waiting on a 170k DWT cargo?",
        "What is our demurrage risk at Paradip and Vizag ports?",
        "What is the 95% confidence interval for freight next week?"
      ]
    },
    {
      "group": "Market Intelligence",
      "prompts": [
        "Give me the latest maritime freight snapshot",
        "How does China PMI impact iron ore freight?",
        "Why did the model issue a WAIT signal?"
      ]
    }
  ]
}
```

**Frontend Usage:**
- Render as a **sidebar** or **quick-start** panel in the chat interface
- Each prompt becomes a **clickable button** that populates the chat input
- Group headers display as section titles

---

## 6. Complete Schema Reference (TypeScript)

### ForecastRequest

```typescript
interface ForecastRequest {
  horizon_days: number;         // 1-30, default: 7
  route: string;                // "BCI" | "C5" | "C3", default: "C5"
  scenario_overrides?: MarketOverride | null;
}
```

### MarketOverride

```typescript
interface MarketOverride {
  iron_ore_price_usd?: number | null;
  brent_crude_usd?: number | null;
  port_congestion_east_india_days?: number | null;
  bunker_fuel_vlsfo_usd?: number | null;
  china_manufacturing_pmi?: number | null;
}
```

### ForecastResponse

```typescript
interface ForecastResponse {
  status: string;                           // Always "success"
  date_evaluated: string;                   // "YYYY-MM-DD"
  target_metric: string;                    // Human-readable metric name
  current_spot_rate: number;                // Current market rate
  predicted_rate: number;                   // AI predicted rate
  expected_change_pct: number;              // % change (positive = rising)
  confidence_interval_95pct: {
    lower: number;
    upper: number;
  };
  recommendation: ProcurementDecision;
  route_details: {
    route_c5_usd_tonne: number;
    route_c3_usd_tonne: number;
    capesize_bci_points: number;
    horizon_days: number;
  };
}
```

### ProcurementDecision

```typescript
interface ProcurementDecision {
  action: "CHARTER_NOW" | "WAIT" | "HOLD_NEUTRAL";
  urgency: "HIGH" | "MEDIUM" | "LOW";
  color: "green" | "red" | "gray";
  rationale: string;            // Plain-English explanation
  expected_change_pct: number;
}
```

### ExecutiveBriefingResponse

```typescript
interface ExecutiveBriefingResponse {
  latest_date: string;
  current_spot_bci: number;
  forecast_7d_bci: number;
  net_rate_change: number;
  procurement_decision: ProcurementDecision;
  bullish_drivers_raising_freight: ShapDriver[];
  bearish_drivers_lowering_freight: ShapDriver[];
  top_overall_factors: ShapDriver[];
  summary_chart_url: string;      // e.g. "/reports/shap_summary.png"
  waterfall_chart_url: string;    // e.g. "/reports/shap_latest_waterfall.png"
}
```

### ShapDriver

```typescript
interface ShapDriver {
  feature: string;          // Feature code (use FEATURE_LABELS to convert)
  current_value: number;    // Current numerical value
  shap_impact: number;      // SHAP contribution (positive = raises freight, negative = lowers)
}
```

### MarketSnapshotResponse

```typescript
interface MarketSnapshotResponse {
  latest_date: string;
  bci_index: number;
  bdi_index: number;
  route_c5_usd_per_tonne: number;
  route_c3_usd_per_tonne: number;
  iron_ore_price_usd: number;
  coking_coal_price_usd: number;
  brent_crude_usd: number;
  bunker_fuel_vlsfo_usd: number;
  port_congestion_east_india_days: number;
  china_manufacturing_pmi: number;
  usd_inr: number;
}
```

### HealthResponse

```typescript
interface HealthResponse {
  status: string;                 // "healthy"
  service: string;
  version: string;
  model_loaded: boolean;
  models_available: string[];     // ["XGBoost", "BiLSTM", "Hybrid_Ensemble"]
  model_test_mape: string;        // "13.76%"
}
```

### ChatRequest

```typescript
interface ChatRequest {
  message: string;                        // Required - user's question
  history?: ChatMessage[];                // Previous turns (optional)
  cargo_tonnes?: number;                  // Default: 170000
  route?: string;                         // "C5" | "C3" | "BCI", default: "C5"
}
```

### ChatMessage

```typescript
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
```

### ChatResponse

```typescript
interface ChatResponse {
  reply: string;                          // Markdown-formatted response
  category: "glossary" | "decision_support" | "market_insight" | "general";
  action_signal?: string | null;          // "CHARTER_NOW" | "WAIT" | "HOLD_NEUTRAL"
  estimated_savings_usd?: number | null;
  estimated_savings_inr_cr?: number | null;
  follow_up_suggestions: string[];
}
```

### MarketHistoryRecord (Array Item)

```typescript
interface MarketHistoryRecord {
  date: string;                           // "YYYY-MM-DD"
  bci_index: number;
  bdi_index: number;
  route_c5_usd_per_tonne: number;
  route_c3_usd_per_tonne: number;
  iron_ore_price_usd: number;
  bunker_fuel_vlsfo_usd: number;
  port_congestion_east_india_days: number;
}
```

---

## 7. Business Logic & Decision Rules

### Procurement Decision Thresholds

The AI generates decisions based on the `expected_change_pct` from the forecast:

| Condition | Action | Urgency | Color | Meaning |
|---|---|---|---|---|
| `expected_change_pct >= +4.0%` | `CHARTER_NOW` | `HIGH` | `green` | Rates rising -- book vessels immediately to lock in current lower rates |
| `expected_change_pct <= -4.0%` | `WAIT` | `MEDIUM` | `red` | Rates falling -- delay tender to capture savings |
| `-4.0% < expected_change_pct < +4.0%` | `HOLD_NEUTRAL` | `LOW` | `gray` | Rates stable -- follow standard procurement schedule |

### Route Details

| Route Code | Full Name | Typical Voyage | Typical Rate Range | Primary Cargo |
|---|---|---|---|---|
| `C5` | Baltic Route C5 (W. Australia to East Coast India/Asia) | 11-14 days | $10 - $16 /tonne | Iron Ore |
| `C3` | Baltic Route C3 (Tubarao, Brazil to East Coast India/Asia) | 35-40 days | $22 - $32 /tonne | Iron Ore |
| `BCI` | Baltic Capesize Index | N/A (Index) | 1,000 - 10,000 pts | Composite Benchmark |

### Indian East Coast Ports

| Port | State | Max DWT | Notes |
|---|---|---|---|
| Paradip | Odisha | Capesize (180k DWT) | Deepwater; major iron ore import |
| Visakhapatnam (Vizag) | Andhra Pradesh | Capesize (180k DWT) | Multi-cargo; steel plant nearby |
| Kamarajar (Ennore) | Tamil Nadu | Mid-size | Coal focus |
| Haldia | West Bengal | Panamax (~75k DWT) | Shallow draft limitation |

### Financial Calculation Constants

```javascript
const CONSTANTS = {
  DEFAULT_CARGO_TONNES: 170000,       // Standard Capesize DWT
  USD_TO_INR: 83.5,                   // Exchange rate used by backend
  CRORE_DIVISOR: 10000000,            // 1 Crore = 10,000,000
  LAKH_DIVISOR: 100000,              // 1 Lakh = 100,000
  DEMURRAGE_PER_DAY_USD: 28000,      // Standard Capesize demurrage rate
  ANNUAL_IMPORT_TONNES: 130000000,    // Ministry of Steel annual import volume
};
```

---

## 8. Error Handling Guide

### HTTP Status Codes

| Code | When | Response Body |
|---|---|---|
| `200` | Successful response | JSON response body |
| `422` | Validation error (bad request body) | `{ "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }` |
| `500` | Internal server error | `{ "detail": "Error message string" }` |

### Validation Error Example (422)

If `horizon_days` is out of range:
```json
{
  "detail": [
    {
      "loc": ["body", "horizon_days"],
      "msg": "Input should be less than or equal to 30",
      "type": "less_than_equal"
    }
  ]
}
```

### Frontend Error Handling Pattern

```javascript
async function callAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (response.status === 422) {
      const error = await response.json();
      // Show validation error to user
      const messages = error.detail.map(d => d.msg).join(', ');
      showToast(`Invalid input: ${messages}`, 'warning');
      return null;
    }

    if (response.status === 500) {
      const error = await response.json();
      showToast(`Server error: ${error.detail}`, 'error');
      return null;
    }

    if (!response.ok) {
      showToast(`Unexpected error (${response.status})`, 'error');
      return null;
    }

    return await response.json();
  } catch (networkError) {
    showToast('Cannot connect to API server. Is it running?', 'error');
    return null;
  }
}
```

---

## 9. Frontend Page & Component Mapping

### Recommended Page Structure

```
Frontend Application
|
+-- Dashboard (Home)
|   +-- Market Snapshot Card       <-- GET /api/v1/market/snapshot
|   +-- AI Decision Banner         <-- GET /api/v1/recommendation
|   +-- Connection Status Badge    <-- GET /health
|   +-- Quick Forecast Widget      <-- POST /api/v1/predict
|
+-- Forecaster Page
|   +-- Route Selector             <-- Local state ("C5", "C3", "BCI")
|   +-- Horizon Selector           <-- Local state (1, 7, 14, 30)
|   +-- What-If Sliders            <-- Feeds into scenario_overrides
|   +-- Cargo Tonnage Input        <-- Local state (default: 170,000)
|   +-- Run Forecast Button        <-- POST /api/v1/predict
|   +-- Prediction Result Card     <-- ForecastResponse
|   +-- Decision Badge             <-- ForecastResponse.recommendation
|   +-- Confidence Interval Bar    <-- ForecastResponse.confidence_interval_95pct
|   +-- Savings Calculator         <-- Computed from response
|
+-- Market Intelligence Page
|   +-- Live Market Indicators     <-- GET /api/v1/market/snapshot
|   +-- Historical Charts          <-- GET /api/v1/market/history?limit=90
|   |   +-- BCI Trend Line
|   |   +-- Route C5/C3 Freight Lines
|   |   +-- Iron Ore vs Freight Overlay
|   |   +-- Port Congestion Bars
|   +-- Period Selector            <-- limit = 7|30|90|180|365
|
+-- Explainability Page
|   +-- Executive Briefing         <-- GET /api/v1/explainability
|   +-- SHAP Summary Chart         <-- <img src="/reports/shap_summary.png">
|   +-- SHAP Waterfall Chart       <-- <img src="/reports/shap_latest_waterfall.png">
|   +-- Bullish Drivers List       <-- bullish_drivers_raising_freight
|   +-- Bearish Drivers List       <-- bearish_drivers_lowering_freight
|   +-- Top Factors Bar Chart      <-- top_overall_factors
|
+-- AI Copilot (Chat Page or Drawer)
|   +-- Chat Messages Area         <-- ChatResponse.reply (Markdown)
|   +-- Follow-up Suggestion Pills <-- ChatResponse.follow_up_suggestions
|   +-- Quick Topics Sidebar       <-- GET /api/v1/chat/suggestions
|   +-- Chat Input Box             <-- POST /api/v1/chat
|   +-- Route Selector Context     <-- ChatRequest.route
|   +-- Cargo Tonnage Input        <-- ChatRequest.cargo_tonnes
|
+-- System Info / About
    +-- API Version                <-- HealthResponse.version
    +-- Models Available           <-- HealthResponse.models_available
    +-- Model Accuracy             <-- HealthResponse.model_test_mape
    +-- API Endpoints Table        <-- GET /api/info
```

### Component Data Dependency Matrix

| Component | Primary Endpoint | Refresh Strategy | Cache TTL |
|---|---|---|---|
| Market Snapshot Card | `GET /market/snapshot` | On page load + manual refresh button | 60s |
| Decision Banner | `GET /recommendation` | On page load | 60s |
| Forecast Result | `POST /predict` | On user "Run" click | No cache (always fresh) |
| Historical Charts | `GET /market/history` | On page load + period change | 300s |
| SHAP Explainability | `GET /explainability` | On page load | 300s |
| Chat Messages | `POST /chat` | On each message send | No cache |
| Chat Suggestions | `GET /chat/suggestions` | Once on chat open | Permanent (static) |
| Health Status | `GET /health` | Every 30-60 seconds | No cache |

---

## 10. Color System & Design Tokens

The existing test interface uses a dark maritime theme. You should use these as a baseline or improve upon them:

### Color Palette

```css
:root {
  /* Background */
  --bg-base: #0a0e17;                /* Main page background */
  --bg-card: #111827;                /* Card/panel background */
  --bg-card-hover: #162032;          /* Card hover state */

  /* Borders */
  --border-subtle: #1f293d;          /* Default card borders */
  --border-highlight: #374151;       /* Hover/focus borders */

  /* Text */
  --text-main: #f3f4f6;             /* Primary text */
  --text-secondary: #9ca3af;        /* Labels, descriptions */
  --text-muted: #6b7280;            /* Tertiary, timestamps */

  /* Brand & Functional */
  --brand-blue: #3b82f6;            /* Primary actions, links */
  --brand-blue-glow: rgba(59, 130, 246, 0.25);
  --brand-green: #10b981;           /* CHARTER_NOW, success, positive */
  --brand-green-glow: rgba(16, 185, 129, 0.2);
  --brand-red: #ef4444;             /* WAIT, alerts, negative */
  --brand-red-glow: rgba(239, 68, 68, 0.2);
  --brand-amber: #f59e0b;           /* Warnings, attention */
  --brand-purple: #8b5cf6;          /* AI/chat accent */
}
```

### Decision Action Color Mapping

```javascript
const DECISION_STYLES = {
  CHARTER_NOW: {
    badge: "green-circle",
    bgColor: "rgba(16, 185, 129, 0.12)",
    textColor: "#34d399",
    borderColor: "#10b981",
    label: "CHARTER NOW",
  },
  WAIT: {
    badge: "red-circle",
    bgColor: "rgba(239, 68, 68, 0.12)",
    textColor: "#f87171",
    borderColor: "#ef4444",
    label: "WAIT & DELAY",
  },
  HOLD_NEUTRAL: {
    badge: "gray-circle",
    bgColor: "rgba(156, 163, 175, 0.15)",
    textColor: "#d1d5db",
    borderColor: "#4b5563",
    label: "HOLD NEUTRAL",
  },
};
```

### Typography

```css
/* Primary Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Monospace (for numbers, rates, codes) */
font-family: 'JetBrains Mono', monospace;
```

**Google Fonts link:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## 11. Sample API Call Flows

### Flow 1: App Initialization

```
1. GET /health --> Check if backend is up --> Show green/red status badge
2. GET /api/v1/market/snapshot --> Populate market indicator cards
3. GET /api/v1/recommendation --> Show decision banner on dashboard
4. GET /api/v1/market/history?limit=90 --> Render historical charts
```

### Flow 2: User Runs a Forecast

```
1. User selects: Route="C5", Horizon=7, adjusts Iron Ore slider to $135
2. POST /api/v1/predict
   Body: { "horizon_days": 7, "route": "C5", "scenario_overrides": { "iron_ore_price_usd": 135.0 } }
3. Display: predicted_rate as hero number, recommendation.action as badge
4. Calculate savings: |predicted - current| x cargo_tonnes
5. Show confidence interval as a range bar
```

### Flow 3: User Asks the AI Copilot

```
1. GET /api/v1/chat/suggestions --> Populate sidebar with quick topic buttons
2. User clicks "What is Demurrage?" or types a question
3. POST /api/v1/chat
   Body: { "message": "What is Demurrage?", "history": [], "route": "C5" }
4. Render response.reply as Markdown
5. Show response.follow_up_suggestions as clickable pill buttons
6. On pill click --> POST /api/v1/chat with that prompt + updated history
```

### Flow 4: SHAP Explainability View

```
1. GET /api/v1/explainability --> Full executive briefing
2. Show procurement_decision as a top banner
3. Render bullish_drivers_raising_freight as green bars
4. Render bearish_drivers_lowering_freight as red bars
5. Load <img src="/reports/shap_summary.png"> for SHAP summary
6. Load <img src="/reports/shap_latest_waterfall.png"> for waterfall chart
```

---

## 12. Glossary of Domain Terms

| Term | What It Is | Why Frontend Developers Need to Know |
|---|---|---|
| **BCI** | Baltic Capesize Index -- benchmark for large ship freight rates | Primary metric displayed on dashboard; used in charts |
| **BDI** | Baltic Dry Index -- overall dry bulk shipping market index | Secondary market indicator |
| **Route C5** | Shipping rate: Australia to India ($/tonne) | Most important route for Ministry of Steel |
| **Route C3** | Shipping rate: Brazil to India ($/tonne) | Secondary route, approx 2x more expensive |
| **VLSFO** | Very Low Sulphur Fuel Oil -- ship fuel | Major cost driver; used in What-If scenarios |
| **Capesize** | Giant bulk carrier ships (>150k DWT) | The vessel class this system targets |
| **DWT** | Deadweight Tonnage -- max cargo capacity | Used for savings calculations |
| **Demurrage** | Daily penalty for port delays (~$28k/day) | Key financial risk the system mitigates |
| **Laytime** | Allowed free days for cargo unloading | Context for port congestion metrics |
| **SHAP** | SHapley Additive exPlanations -- AI explanation | Powers the Explainability page |
| **PMI** | Purchasing Managers Index (>50 = growth) | Economic indicator shown in market cards |
| **CFR** | Cost & Freight -- seller ships; FOB -- buyer ships | Context for procurement decisions |
| **Crore (Cr)** | Indian denomination = 10,000,000 INR | Used for displaying savings in INR |
| **CHARTER_NOW** | Decision: Book vessel immediately | Green badge action |
| **WAIT** | Decision: Delay tender for 4-7 days | Red badge action |
| **HOLD_NEUTRAL** | Decision: Follow normal procurement schedule | Gray badge action |

---

## Appendix A: Complete Endpoint Quick Reference

| Method | URL | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/health` | System health check | -- | `HealthResponse` |
| `GET` | `/api/info` | API endpoint directory | -- | JSON Object |
| `POST` | `/api/v1/predict` | AI freight rate forecast | `ForecastRequest` | `ForecastResponse` |
| `GET` | `/api/v1/recommendation` | Chartering decision | -- | `ProcurementDecision` |
| `GET` | `/api/v1/explainability` | SHAP executive briefing | -- | `ExecutiveBriefingResponse` |
| `GET` | `/api/v1/market/snapshot` | Latest market indicators | -- | `MarketSnapshotResponse` |
| `GET` | `/api/v1/market/history` | Historical time-series | `?limit=90` (query param) | `Array of Records` |
| `POST` | `/api/v1/chat` | AI Copilot chat | `ChatRequest` | `ChatResponse` |
| `GET` | `/api/v1/chat/suggestions` | Chat quick prompts | -- | JSON Object |
| `GET` | `/reports/shap_summary.png` | SHAP summary plot | -- | PNG Image |
| `GET` | `/reports/shap_latest_waterfall.png` | SHAP waterfall plot | -- | PNG Image |

---

## Appendix B: Model Performance Reference

| Model | MAE | RMSE | MAPE | Directional Accuracy |
|---|---|---|---|---|
| **XGBoost** (Primary) | 166.3 | 204.27 | 10.6% | 67.63% |
| **BiLSTM** (Deep Learning) | 327.89 | 371.56 | 25.38% | 50.46% |
| **Hybrid Ensemble** | 197.28 | 240.41 | 14.18% | 61.47% |

**Ensemble Weights:** XGBoost 55% + BiLSTM 35% + Ridge Regression 10%

---

*Document generated from source code analysis of the SIH26006 backend codebase.*  
*For interactive testing, visit http://localhost:8000/docs (Swagger UI).*
