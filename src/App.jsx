import { useState } from 'react'
import { InputBox, RouteCard } from './components'
import useRates from './hooks/useRates'
import './index.css'
const BG_IMAGE =
  'https://images.pexels.com/photos/7412098/pexels-photo-7412098.jpeg?auto=compress&cs=tinysrgb&w=1600'

function App() {
  const [amount, setAmount] = useState(1000)
  const [from, setFrom] = useState('BRL')
  const [to, setTo] = useState('INR')
  const [convertedAmount, setConvertedAmount] = useState(0)
  const [route, setRoute] = useState(null)

  const { engine, source, updatedAt, error, refresh } = useRates()

  if (error) return <p className="text-center text-red-400 mt-16">Failed to load rates: {error}</p>
  if (!engine) return <p className="text-center text-slate-300 mt-16">Loading rates…</p>

  const options = engine.names

  const swap = () => {
    setFrom(to)
    setTo(from)
    setConvertedAmount(amount)
    setAmount(convertedAmount)
    setRoute(null)
  }

  const convert = () => {
    if (from === to) { setConvertedAmount(amount); setRoute(null); return }
    const r = engine.route(from, to)
    setRoute(r)
    setConvertedAmount(Number((amount * r.rate).toFixed(2)))
  }

  return (
   <div
  className="min-h-screen bg-slate-950 bg-cover bg-center bg-fixed flex justify-center items-start px-4 py-10"
  style={{ backgroundImage: `url(${BG_IMAGE})` }}>
    
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl">
        <h1 className="text-2xl font-bold text-white">Mudra Engine</h1>
        <p className="text-slate-300 text-sm mb-3">Cheapest route for your money, not just the direct rate.</p>

        <div className="flex items-center justify-between text-xs mb-4">
          <span className={source === 'live' ? 'text-emerald-400' : 'text-amber-400'}>
            ● {source === 'live' ? `Live rates${updatedAt ? ` · ${updatedAt}` : ''}` : source === 'loading' ? 'Refreshing…' : 'Offline fallback rates'}
          </span>
          <button onClick={() => { refresh(); setRoute(null) }} className="text-slate-300 underline cursor-pointer">
            Refresh
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); convert() }}>
          <InputBox
            label="From"
            amount={amount}
            currencyOptions={options}
            onCurrencyChange={setFrom}
            selectCurrency={from}
            onAmountChange={setAmount}
          />
          <div className="relative w-full h-0.5">
            <button
              type="button"
              onClick={swap}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-slate-950 rounded-md bg-emerald-400 text-slate-900 font-semibold px-3 py-1 cursor-pointer"
            >
              swap
            </button>
          </div>
          <InputBox
            label="To"
            amount={convertedAmount}
            currencyOptions={options}
            onCurrencyChange={setTo}
            selectCurrency={to}
            amountDisable
          />
          <button type="submit" className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-bold px-4 py-3 rounded-lg mt-4 cursor-pointer">
            Find cheapest route {from} → {to}
          </button>
        </form>

        <RouteCard amount={amount} from={from} to={to} route={route} />
      </div>
    </div>
  )
}

export default App
