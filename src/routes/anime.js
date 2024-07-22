import { error } from "console";
import { Router }  from "express";
import { promises as fs } from 'fs'
import path from "path";
import { fileURLToPath } from "url";


const routerAnime=Router()
const _filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(_filename)




const animefilePath=path.join(__dirname, "../../data/anime.json" )

const readAnimeFs= async()=>{
    try{
        const animes=fs.readFile(animefilePath, `utf-8`)
        return json.parse(animes)
    }catch(err){
        throw new error (`error en la promesa ${err}`)

    }
}

const writeAnimeFs=async()=>{
    await fs.writeFile(animefilePath, JSON.stringify(animes, null,2));
}

routerAnime.post("/postAnimes",async(req,res)=>{
    const animes = await readAnimeFs()
    const newAnime={
        id:animes.length+1,
        title:req.body.title,
        genere: req.body.genre
    }

    animes.push(newAnime)
    await writeAnimeFs(animes)
    res.status(201).send(`anime created sucefully ${JSON.stringify(newAnime)}`)

})




routerAnime.get("/", async(req,res)=>{
    const animes= res.json(animes)
})



routerAnime.get("/:id",async(req,res)=>{
    const animes = await readAnimeFs()
    const anime=animes.find(a=> a.id=== parseInt(req.params.animeId))
    if(!anime) return res.status(404).send("anime not fund")
    res.json(anime)
})


routerAnime.put("/:id", async(req, res)=>{
    const animes=await readAnimeFs()
    const indexAnime = animes.findIndex(a=>a.id=== parseInt(req.params.id))
    const updateAnime={
        ...animes[indexAnime],
        title: req.body.title,
        genere: req.body.genere
    }
    animes[indexAnime]=updateAnime
    await writeAnimeFs(animes)
    res.status(200).send(`animes update successfully ${JSON.stringify(updateAnime)}`)

})



routerAnime.delete("/delete/:id", async (req, res)=>{
    let animes = await readAnimeFs();
    const anime =animes.find(a=>a.id===parseInt(req.params.id))
    if(!anime) return  res.status(404).send("anime not found")
    animes= animes.filter(a => a.id !== anime.id)
    await writeAnimeFs(animes)
    res.send("anime deleted successfully")


})





export default routerAnime