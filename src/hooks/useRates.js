import { useCallback, useEffect, useState } from 'react'
import { MudraEngine } from '../engine/MudraEngine'


const SOURCES = [
  async () => {
    const r = await fetch('https://open.er-api.com/v6/latest/USD')
    const d = await r.json()
    if (d.result !== 'success') throw new Error('er-api failed')
    return { rates: d.rates, updatedAt: d.time_last_update_utc }
  },
  async () => {
   
    const r = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')
    const d = await r.json()
    const rates = {}
    Object.entries(d.usd).forEach(([k, v]) => (rates[k.toUpperCase()] = v))
    return { rates, updatedAt: d.date }
  },
]

async function fetchLive() {
  for (const src of SOURCES) {
    try { return await src() } catch {}
  }
  throw new Error('all live sources failed')
}


async function buildEngine() {
  const csv = await (await fetch('/rates.csv')).text()
  const currencies = MudraEngine.parseCsv(csv)
  let source = 'offline', updatedAt = null
  try {
    const live = await fetchLive()
    for (const code of Object.keys(currencies)) {
      if (live.rates[code] > 0) currencies[code].rate = live.rates[code]
    }
    source = 'live'; updatedAt = live.updatedAt
  } catch {  }
  return { engine: new MudraEngine(currencies), source, updatedAt, error: null }
}


function useRates() {
  const [state, setState] = useState({ engine: null, source: 'loading', updatedAt: null, error: null })

  const load = useCallback(() => {
    return buildEngine()
      .then(setState)
      .catch((e) => setState((s) => ({ ...s, source: 'error', error: e.message })))
  }, [])

  useEffect(() => { load() }, [load])

  const refresh = useCallback(() => {
    setState((s) => ({ ...s, source: 'loading' }))
    return load()
  }, [load])

  return { ...state, refresh }
}

export default useRates
