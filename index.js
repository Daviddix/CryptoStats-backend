const express = require("express")

const app = express()
app.use(express.json())
require("dotenv").config()
const PORT = process.env.PORT || 3000

const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": process.env.COIN_GECKO_API_KEY, 
    },
}

app.get("/api/getTrendingCoins", async (req,res)=>{
    
    try{
        const rawFetch = await fetch('https://api.coingecko.com/api/v3/search/trending', options)

        const response = await rawFetch.json()

        if(!rawFetch.ok){
            return res.status(500).json({status: "error", reason : "Could not get trending coins"})
        }

        res.json(response.coins)
    }
    catch(err){
        return res.status(500).json({status : "error", reason : "An error ocurred on the server", info: err})
    }
})

app.get("/api/search", async(req, res)=>{
    try{
        const {searchQuery, categoryQuery} = req.query

        const rawFetch = await fetch(`https://api.coingecko.com/api/v3/search?query=${searchQuery}`, options)

        if(!rawFetch.ok){
            return res.status(500).json({status: "error", reason : "An error ocurred when trying to get search term"})
        }

        const {coins} = await rawFetch.json()

        const coinNames = coins.map((coin)=>{
            return coin.id
        })

        if (coinNames.length === 0) {
            return res.status(404).json({ status: "error", reason: "No coins found" });
          }

        const coinNamesFetchUrl = coinNames.join("%2C")

        const searchCategory = categoryQuery == "All" ? "" : `&category=${categoryQuery}`

        const rawFetchAgain = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinNamesFetchUrl}${searchCategory}`, options)
    
        const coinsInfo = await rawFetchAgain.json()
    
        if(!rawFetchAgain.ok){
            return res.status(500).json({status: "error", reason : coinsInfo})
        }
    
        res.send(coinsInfo)

    }
    catch(err){
        return res.status(500).json({status : "error", reason : "An error ocurred on the server", info: err})
    }
})

app.listen(PORT, ()=>{
    console.log("i am alive")
})