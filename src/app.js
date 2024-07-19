import  express  from "express";
import dotenv from "dotenv"
import errorHandler from "./middleware/error.handler.js";
import routerAnime from "./routes/anime.js";

const app= express()
dotenv.config()

const PORT= process.env.PORT || 3010


app.use(express.json())
app.use(errorHandler)
app.use(`/animes`, routerAnime)


app.listen(PORT,()=>{
    console.log(`el puerto esta siendo escuchado en http://localhost:${PORT} `)
})

