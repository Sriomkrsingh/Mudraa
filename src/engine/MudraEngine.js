// JavaScript port of MudraEngine.cpp
// Edge weight = -ln(midRate * (1 - fee)); Dijkstra then maximises the product of rates.

// Fee (fraction) per tier pair. Thin-to-thin trades are the most expensive.
const FEE = { AA: 0.002, AB: 0.003, AC: 0.008, BB: 0.006, BC: 0.015, CC: 0.03 }

export class MudraEngine {
  constructor(currencies) {
    this.currencies = currencies // { USD: { rate, tier }, ... }
    this.names = Object.keys(currencies)
    this.cache = new Map()
    this.graph = this.#buildGraph()
  }

  static parseCsv(text) {
    const out = {}
    text.trim().split(/\r?\n/).slice(1).forEach((line) => {
      const [code, rate, tier] = line.split(',').map((s) => s.trim())
      if (code && +rate > 0 && /^[ABC]$/i.test(tier)) {
        out[code.toUpperCase()] = { rate: +rate, tier: tier.toUpperCase() }
      }
    })
    return out
  }

  #buildGraph() {
    const g = {}
    for (const a of this.names) {
      g[a] = []
      for (const b of this.names) {
        if (a === b) continue
        const mid = this.currencies[b].rate / this.currencies[a].rate
        const fee = FEE[[this.currencies[a].tier, this.currencies[b].tier].sort().join('')]
        const eff = mid * (1 - fee)
        g[a].push({ to: b, mid, fee, eff, w: -Math.log(eff) })
      }
    }
    return g
  }

  route(src, dst) {
    const key = `${src}|${dst}`
    if (this.cache.has(key)) return { ...this.cache.get(key), cached: true }

    const dist = {}, prev = {}, done = new Set()
    this.names.forEach((n) => (dist[n] = Infinity))
    dist[src] = 0

    while (true) {
      let u = null
      for (const n of this.names) if (!done.has(n) && (u === null || dist[n] < dist[u])) u = n
      if (u === null || dist[u] === Infinity || u === dst) break
      done.add(u)
      for (const e of this.graph[u]) {
        const nd = dist[u] + e.w
        if (nd < dist[e.to]) { dist[e.to] = nd; prev[e.to] = u }
      }
    }

    const path = []
    for (let n = dst; n; n = prev[n]) { path.unshift(n); if (n === src) break }
    const hops = path.slice(1).map((n, i) => this.graph[path[i]].find((e) => e.to === n))
    const direct = this.graph[src].find((e) => e.to === dst)

    const result = {
      path,
      hops,
      rate: Math.exp(-dist[dst]),
      directRate: direct.eff,
      directFee: direct.fee,
      midRate: direct.mid,
    }
    this.cache.set(key, result)
    return result
  }
}
