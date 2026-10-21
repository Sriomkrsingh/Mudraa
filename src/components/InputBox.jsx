import React, { useId } from 'react'

function InputBox({
  label,
  amount,
  onAmountChange,
  onCurrencyChange,
  currencyOptions = [],
  selectCurrency = 'USD',
  amountDisable = false,
  className = '',
}) {
  const id = useId()
  return (
    <div className={`bg-slate-800 border border-slate-700 p-4 rounded-xl text-sm flex gap-3 ${className}`}>
      <div className="w-1/2">
        <label htmlFor={id} className="text-slate-400 mb-2 inline-block text-xs uppercase tracking-wide">
          {label}
        </label>
        <input
          id={id}
          className="outline-none w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-lg py-2 px-3 text-slate-100 disabled:opacity-80"
          type="number"
          placeholder="0"
          disabled={amountDisable}
          value={amount}
          onChange={(e) => onAmountChange && onAmountChange(Number(e.target.value))}
        />
      </div>
      <div className="w-1/2 flex flex-wrap justify-end text-right">
        <p className="text-slate-400 mb-2 w-full text-xs uppercase tracking-wide">Currency</p>
        <select
          className="rounded-lg px-3 py-2 bg-slate-900 border border-slate-700 text-slate-100 cursor-pointer outline-none w-full"
          value={selectCurrency}
          onChange={(e) => onCurrencyChange && onCurrencyChange(e.target.value)}
        >
          {currencyOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default InputBox
