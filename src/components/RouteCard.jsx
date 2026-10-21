import React from 'react'

const fmt = (n, d = 2) => n.toLocaleString(undefined, { maximumFractionDigits: d })

function RouteCard({ amount, from, to, route }) {
  if (!route) return null
  const best = amount * route.rate
  const direct = amount * route.directRate
  const saved = best - direct
  const detour = route.path.length > 2

  return (
    <div className="mt-4 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100">
      <div className="flex flex-wrap items-center gap-2">
        {route.path.map((c, i) => (
          <React.Fragment key={c + i}>
            <span className="bg-emerald-900/60 text-emerald-300 font-semibold px-3 py-0.5 rounded-full text-sm">{c}</span>
            {i < route.path.length - 1 && <span className="text-slate-500">→</span>}
          </React.Fragment>
        ))}
        {route.cached && (
          <span className="ml-auto text-[11px] border border-slate-600 text-slate-400 rounded px-2">cache hit</span>
        )}
      </div>
      <p className="text-slate-400 text-sm mt-2 mb-2">
        {detour ? 'A detour beats the direct trade.' : 'The direct trade is already the cheapest.'}
      </p>
      <Row k={`Direct ${from}→${to}`} v={`${fmt(direct)} ${to} · fee ${(route.directFee * 100).toFixed(2)}%`} />
      <Row k="Mudra route" v={`${fmt(best)} ${to}`} />
      <Row k="You save" v={`${fmt(saved)} ${to}`} strong />
      {route.hops.length > 1 && (
        <Row k="Per-hop fees" v={route.hops.map((h) => (h.fee * 100).toFixed(1) + '%').join(' + ')} />
      )}
    </div>
  )
}

const Row = ({ k, v, strong }) => (
  <div className="flex justify-between gap-3 text-sm py-1.5 border-t border-slate-700">
    <span className="text-slate-400">{k}</span>
    <span className={strong ? 'text-emerald-400 font-semibold' : ''}>{v}</span>
  </div>
)

export default RouteCard
