import { useState } from 'react'

export default function Forecast({ apiBase }) {
  const [route, setRoute] = useState('C5')
  const [horizon, setHorizon] = useState('7')
  const [ironOre, setIronOre] = useState('104')
  const [portWait, setPortWait] = useState('4.5')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [showResult, setShowResult] = useState(false)

  async function runForecast() {
    setError('')

    const body = {
      horizon_days: parseInt(horizon, 10),
      route: route,
      scenario_overrides: {
        iron_ore_price_usd: parseFloat(ironOre),
        port_congestion_east_india_days: parseFloat(portWait),
      },
    }
    
    try {
      const res = await fetch(`${apiBase}/api/v1/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error(`API returned status ${res.status}`)

      const data = await res.json()
      setResult(data)
      setShowResult(true)
    } catch (err) {
      setError(`Error: ${err.message}`)
    }
  }

  return (
    <div>
      <h2>Forecast Request</h2>

      <label>Route</label>
      <select value={route} onChange={(e) => setRoute(e.target.value)}>
        <option value="C5">Route C5 (W. Australia -&gt; India)</option>
        <option value="C3">Route C3 (Brazil -&gt; India)</option>
        <option value="BCI">Route BCI (Overall Capesize Index)</option>
      </select>

      <label>Forecast Horizon</label>
      <select value={horizon} onChange={(e) => setHorizon(e.target.value)}>
        <option value="7">7 days</option>
        <option value="14">14 days</option>
        <option value="30">30 days</option>
      </select>

      <label>Iron Ore Price (${ironOre}/tonne)</label>
      <input
        type="range"
        min="50"
        max="200"
        value={ironOre}
        onChange={(e) => setIronOre(e.target.value)}
      />

      <label>Port Wait Days ({portWait} days)</label>
      <input
        type="range"
        min="0"
        max="15"
        step="0.5"
        value={portWait}
        onChange={(e) => setPortWait(e.target.value)}
      />

      <button onClick={runForecast}>Run Forecast</button>
      {error && <p className="forecast-error">{error}</p>}

      <hr />

      {/* Results section */}
      {showResult && result && (
        <div className="output-selection">
          <h2>Recommendation</h2>
          <p>
            <strong>Action:</strong> {result.recommendation?.action || '--'} (
            {result.recommendation?.urgency || '--'} urgency)
          </p>
          <p>{result.recommendation?.rationale || ''}</p>
          <p>
            <strong>Predicted Rate:</strong> {result.predicted_rate} (
            {result.expected_change_pct > 0 ? '+' : ''}
            {result.expected_change_pct}%)
          </p>
          <p>
            <strong>Current Spot Rate:</strong> {result.current_spot_rate}
          </p>

          <details>
            <summary>Raw JSON Response</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}