# Mudra Engine: Smart Currency Exchange & Routing System

![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646cff.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS_v4-38bdf8.svg)
![Algorithms](https://img.shields.io/badge/Algorithms-Graph_Theory-orange.svg)
![Maths](https://img.shields.io/badge/Maths-Logarithmic_Optimization-purple.svg)
![Rates](https://img.shields.io/badge/Rates-Live_API_+_Offline_Fallback-success.svg)

**Mudra Engine** is a fast, browser-based routing system I **developed** to find the cheapest way to convert money across borders. It uses graph **algorithms** to calculate whether a direct currency exchange is the best option, or if taking a multi-step "detour" through major currencies (like USD or EUR) will save you money on bank fees.


## 🚀 Why I Built This

When you send money directly between two smaller economies (for example, Brazilian Real to Indian Rupee), banks charge large hidden fees (spreads) because those trades are rare.

However, trading Brazilian Real to US Dollars, and then US Dollars to Indian Rupees is very common, so the fees are much smaller. Mudra Engine acts like a "Google Maps for Money." It scans exchange rates and fees to find the most cost-effective path for your money to travel.

## 🧠 How the Algorithm and Maths Work

Standard pathfinding **algorithms (like Dijkstra's)** are designed to *add* distances together. But in finance, exchange rates are *multiplied*. You cannot just plug currency rates into a standard algorithm.

To solve this, I **engineered** a mathematical trick using Logarithms:

1. **Calculate the Real Rate:** First, the engine subtracts the fee from the market rate.
   `Effective Rate = Mid-Market Rate * (1 - Fee %)`

2. **The Maths Transformation:** I used a negative natural logarithm to turn the multiplication problem into an addition problem.
   `Edge Weight = -ln(Effective Rate)`

3. **Shortest Path:** Dijkstra's algorithm runs on these weights. The smallest total weight is the route that returns the most money: `Final Amount = Amount * e^(-Total Weight)`.

Because the weights are logarithms, minimising their sum is the same as maximising the product of effective rates along the path.

## ⚙️ Key Features

* **Cheapest-Route Search:** A custom Dijkstra's Algorithm, ported from C++ to JavaScript, explores every route across the currency graph (direct and multi-hop).
* **Live Exchange Rates:** Fetches current mid-market rates from public APIs (`open.er-api.com`, with `fawazahmed0/currency-api` as backup). If the network is down, it falls back to the rates in `rates.csv`.
* **Smart Memory:** A route cache (`Map` keyed by `source|destination`) returns repeat queries instantly. A "cache hit" badge shows when it is used, and the cache clears when rates refresh.
* **Route Breakdown UI:** Shows the full path (for example `BRL → USD → INR`), per-hop fees, direct vs. routed result, and how much you save.
* **Tiered Fee Model:** Fees depend on how deep the market is for both currencies (tier A, B or C), so thin-to-thin trades cost more than trades through major currencies.
* **Dynamic Data:** Currencies, tiers and fallback rates live in `public/rates.csv`, so you can change the market without touching the code.
* **Clean Separation:** The engine (`src/engine`) is independent of React, so it can be reused or tested on its own.

## 🧰 Tech Stack

React 19, Vite, Tailwind CSS v4, ESLint, JavaScript (ES modules), Graph Theory, Data Structures & Algorithms, Caching, Custom Hooks.

## 📁 Project Structure

```
mudraengine/
├── public/
│   ├── favicon.svg
│   └── rates.csv              # currencies, fee tiers, offline fallback rates
├── src/
│   ├── components/
│   │   ├── InputBox.jsx       # reusable amount + currency input
│   │   ├── RouteCard.jsx      # route and savings breakdown
│   │   └── index.js
│   ├── engine/
│   │   └── MudraEngine.js     # graph, Dijkstra, cache (port of the C++ engine)
│   ├── hooks/
│   │   └── useRates.js        # live rates with CSV fallback
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

## 🛠️ How to Run on Your Machine

Requires **Node.js 18 or later**. Run the following commands in your terminal:

```bash
# 1. Download the code and open the folder
git clone https://github.com/Sriomkrsingh/MudraEngine.git
cd MudraEngine

# 2. Install dependencies
npm install

# 3. Start the app (opens at http://localhost:5173)
npm run dev
```

Other commands:

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # run ESLint
```

## 🔧 Configuration

**`public/rates.csv`**

```csv
code,fallback_rate_per_usd,tier
USD,1,A
EUR,0.92,A
INR,83.5,C
```

* `code`: currency code
* `fallback_rate_per_usd`: used only when live rates cannot be fetched
* `tier`: market depth, `A` (deepest), `B`, or `C` (thinnest)

**Fee by tier pair** (in `src/engine/MudraEngine.js`):

| Pair | Fee |
| --- | --- |
| A–A | 0.2% |
| A–B | 0.3% |
| A–C | 0.8% |
| B–B | 0.6% |
| B–C | 1.5% |
| C–C | 3.0% |

## ⚠️ Limitations

* **Fees are simulated.** Public APIs give mid-market rates only, not real bank spreads, so the tier table is an assumption. Savings in the UI demonstrate the algorithm, not guaranteed real-world savings.
* **No money movement.** This is a routing and decision-support tool. It does not execute transactions.
* **Costs not modelled:** flat transfer fees, minimum amounts, limits, settlement time and slippage.
* **Negative weights.** When an effective rate is above 1 (for example USD to INR), `-ln(rate)` is negative, and Dijkstra assumes non-negative weights, so results can be suboptimal in some cases. Bellman-Ford is the planned fix.

## 🗺️ Roadmap

- [ ] Bellman-Ford to handle negative edge weights correctly
- [ ] Arbitrage (negative cycle) detection
- [ ] Real per-pair spread data instead of the tier table
- [ ] Priority-queue Dijkstra for larger graphs
- [ ] Unit tests for the engine
- [ ] Deploy to Vercel / Netlify

