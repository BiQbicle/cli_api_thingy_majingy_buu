const API_KEY = process.env.WEATHER_API_KEY;

const args = process.argv.slice(2);
const arg = (flag: string, fallback?: string) => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
};

const city = arg("--city", "Islamabad");
const country = arg("--country", "PK");
const stock = arg("--stock", "AAPL");
const period = arg("--period", "24h");

async function getWeather(city: string, country: string) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error (${res.status})`);
  const data = await res.json();

  return {
    location: `${data.name}, ${country}`,
    temperature: `${data.main.temp}°C`,
    condition: data.weather[0].description,
    humidity: `${data.main.humidity}%`,
  };
}

async function getStock(symbol: string, period: string) {
  const rangeMap: Record<string, string> = {
    "24h": "1d",
    "7d": "5d",
    "1m": "1mo",
  };
  const range = rangeMap[period] || "1d";

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=1h`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Stock API error (${res.status})`);
  const data = await res.json();

  const meta = data.chart.result[0].meta;
  const lastClose = meta.regularMarketPrice;
  const currency = meta.currency;

  return {
    symbol,
    price: `${lastClose} ${currency}`,
    range,
  };
}

async function main() {
  console.log("Fetching data...\n");

  const [weather, stockData] = await Promise.allSettled([
    getWeather(city, country),
    getStock(stock, period),
  ]);

  const output = {
    timestamp: new Date().toISOString(),
    query: { city, country, stock, period },
    data: {
      weather: weather.status === "fulfilled" ? weather.value : null,
      stock: stockData.status === "fulfilled" ? stockData.value : null,
    },
    errors: {
      weather: weather.status === "rejected" ? weather.reason.message : null,
      stock: stockData.status === "rejected" ? stockData.reason.message : null,
    },
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch(console.error);
