// src/index.ts

const args = process.argv.slice(2)

async function main() {
  console.log("Starting CLI...")
  console.log("Args:", args)
}

main().catch(console.error)


// try running bun run ./index.ts --city "Tokyo" --stocks "AAPL,MSFT"Retry  , to get the args