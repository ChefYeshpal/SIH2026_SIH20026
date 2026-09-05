// ============================================================
//                          CONFIG
// ============================================================
const API_BASE = "http://localhost:8000";


// HEALTH CHECK should run on page load
// Endpoint: GET /health  (from BACKEND_API_DOCUMENTATION.md, section 5.1)

async function checkHealth() {
  const status = document.getElementById("status");
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    if (data.status === "healthy") {
      status.textContent = `Backend connected (models: ${data.models_available.join(", ")})`;
    } else {
      status.textContent = "Backend responded but not healthy.";
    }
  } catch (err) {
    status.textContent =
      "Backend not reachable. You need run_api.py running first (see README).";
  }
}

// ============================================================
// RUN FORECAST
// Endpoint: POST /api/v1/predict  (from BACKEND_API_DOCUMENTATION.md, section 5.2)
//
// Request body shape (ForecastRequest):
//   horizon_days: integer, 1-30
//   route: "BCI" | "C5" | "C3"
//   scenario_overrides: { iron_ore_price_usd, port_congestion_east_india_days, ... }
// ============================================================
async function runForecast() {
  const errorEl = document.getElementById("forecast-error");
  errorEl.textContent = "";

  const route = document.getElementById("route").value;
  const horizon = parseInt(document.getElementById("horizon").value, 10);
  const ironOre = parseFloat(document.getElementById("iron-ore").value);
  const portWait = parseFloat(document.getElementById("port-wait").value);

  const body = {
    horizon_days: horizon,
    route: route,
    scenario_overrides: {
      iron_ore_price_usd: ironOre,
      port_congestion_east_india_days: portWait,
    },
  };

  try {
    const res = await fetch(`${API_BASE}/api/v1/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`API returned status ${res.status}`);

    const data = await res.json();
    renderForecastResult(data);
  } catch (err) {
    errorEl.textContent = `Error: ${err.message}`;
  }
}

// Fill in the output section using response field names
// from BACKEND_API_DOCUMENTATION.md, section 5.2 example response
function renderForecastResult(data) {
  document.getElementById("output-section").style.display = "block";

  const rec = data.recommendation || {};
  document.getElementById("action-text").textContent = rec.action || "--";
  document.getElementById("urgency-text").textContent = rec.urgency || "--";
  document.getElementById("rationale-text").textContent = rec.rationale || "";

  document.getElementById("predicted-rate").textContent =
    `${data.predicted_rate} (${data.expected_change_pct > 0 ? "+" : ""}${data.expected_change_pct}%)`;
  document.getElementById("current-rate").textContent = data.current_spot_rate;

  const ci = data.confidence_interval_95pct || {};
  document.getElementById("confidence-range").textContent = `[${ci.lower} - ${ci.upper}]`;

  document.getElementById("raw-json").textContent = JSON.stringify(data, null, 2);
}

checkHealth();