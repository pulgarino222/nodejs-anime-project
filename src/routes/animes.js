import { Router } from 'express'; // Importa el Router de Express para manejar rutas
import { promises as fs } from 'fs'; // Importa el módulo de promesas de fs para operaciones de archivo asíncronas
import path from 'path'; // Importa el módulo path para manipulación de rutas de archivo
import { fileURLToPath } from 'url'; // Importa fileURLToPath para convertir URLs de archivo en rutas de archivo

const router = Router(); // Crea una instancia de Router para definir rutas
const _filename = fileURLToPath(import.meta.url); // Obtiene la ruta del archivo actual
const _dirname = path.dirname(_filename); // Obtiene el directorio del archivo actual
const animesFilePath = path.join(_dirname, "../../data/animes.json"); // Ruta al archivo JSON de animes
const studiosFilePath = path.join(_dirname, "../../data/studios.json"); // Ruta al archivo JSON de estudios

// Leer los animes desde el archivo
async function readAnimes() {
    try {
        const animeData = await fs.readFile(animesFilePath); // Lee el archivo de animes
        return JSON.parse(animeData); // Parsea el contenido del archivo y lo devuelve como objeto JSON
    } catch (error) {
        throw new Error(`Error en la promesa ${error.message}`); // Maneja errores en la lectura del archivo
    }
}

// Leer los estudios desde el archivo
async function readStudios() {
    try {
        const studiosData = await fs.readFile(studiosFilePath); // Lee el archivo de estudios
        return JSON.parse(studiosData); // Parsea el contenido del archivo y lo devuelve como objeto JSON
    } catch (error) {
        throw new Error(`Error en la promesa ${error.message}`); // Maneja errores en la lectura del archivo
    }
}

// Escribir animes en el archivo
async function writeAnimes(animes) {
    try {
        await fs.writeFile(animesFilePath, JSON.stringify(animes, null, 2)); // Escribe el contenido de animes en el archivo en formato JSON
    } catch (error) {
        throw new Error(`Error en la promesa ${error.message}`); // Maneja errores en la escritura del archivo
    }
}

// Crear un nuevo anime
router.post("/", async (req, res) => { // Define una ruta POST para crear un nuevo anime
    const animes = await readAnimes(); // Lee los animes existentes
    const studios = await readStudios(); // Lee los estudios existentes

    const studio = studios.find(studio => studio.id === req.body.studioId); // Busca el estudio con el ID proporcionado
    if (!studio) { // Verifica si el estudio existe
        return res.status(400).json({ message: "ID de estudio no válido" }); // Responde con un error si el estudio no existe
    }

    const newAnime = { // Crea un nuevo objeto de anime
        id: animes.length + 1, // Asigna un ID único
        title: req.body.title, // Asigna el título del anime
        genre: req.body.genre, // Asigna el género del anime
        studioId: req.body.studioId // Asigna el ID del estudio del anime
    };
    animes.push(newAnime); // Añade el nuevo anime a la lista de animes
    await writeAnimes(animes); // Guarda la lista actualizada de animes en el archivo
    res.status(201).json({ message: "Anime creado exitosamente", anime: newAnime }); // Responde con éxito y el nuevo anime
});

// Obtener todos los animes con datos del estudio
router.get("/", async (req, res) => { // Define una ruta GET para obtener todos los animes
    const animes = await readAnimes(); // Lee los animes existentes
    const studios = await readStudios(); // Lee los estudios existentes
    const animesWithStudios = animes.map(anime => { // Mapea los animes para incluir el nombre del estudio
        const studio = studios.find(studio => studio.id === anime.studioId); // Busca el estudio asociado con el anime
        return {
            ...anime, // Incluye todas las propiedades del anime
            studioName: studio ? studio.name : 'Desconocido' // Incluye el nombre del estudio o 'Desconocido' si no se encuentra
        };
    });
    res.json(animesWithStudios); // Responde con la lista de animes y nombres de estudios
});

// Obtener un anime por ID con datos del estudio
router.get("/:id", async (req, res) => { // Define una ruta GET para obtener un anime por ID
    const animes = await readAnimes(); // Lee los animes existentes
    const studios = await readStudios(); // Lee los estudios existentes
    const anime = animes.find(anime => anime.id === parseInt(req.params.id)); // Busca el anime por ID
    if (!anime) { // Verifica si el anime existe
        return res.status(404).json({ message: "Anime no encontrado" }); // Responde con un error si el anime no se encuentra
    }
    const studio = studios.find(studio => studio.id === anime.studioId); // Busca el estudio asociado con el anime
    res.json({ // Responde con el anime y el nombre del estudio
        ...anime, // Incluye todas las propiedades del anime
        studioName: studio ? studio.name : 'Desconocido' // Incluye el nombre del estudio o 'Desconocido' si no se encuentra
    });
});

// Actualizar un anime por ID
router.put("/:id", async (req, res) => { // Define una ruta PUT para actualizar un anime por ID
    const animes = await readAnimes(); // Lee los animes existentes
    const studios = await readStudios(); // Lee los estudios existentes

    const studio = studios.find(studio => studio.id === req.body.studioId); // Busca el estudio con el ID proporcionado
    if (!studio) { // Verifica si el estudio existe
        return res.status(400).json({ message: "ID de estudio no válido" }); // Responde con un error si el estudio no existe
    }

    const animeIndex = animes.findIndex(anime => anime.id === parseInt(req.params.id)); // Encuentra el índice del anime que se va a actualizar
    if (animeIndex === -1) { // Verifica si el anime existe
        return res.status(404).json({ message: 'Anime no existe' }); // Responde con un error si el anime no se encuentra
    }
    const updatedAnime = { // Crea un objeto de anime actualizado
        ...animes[animeIndex], // Incluye todas las propiedades del anime existente
        title: req.body.title, // Actualiza el título del anime
        genre: req.body.genre, // Actualiza el género del anime
        studioId: req.body.studioId // Actualiza el ID del estudio del anime
    };
    animes[animeIndex] = updatedAnime; // Reemplaza el anime existente con el actualizado
    await writeAnimes(animes); // Guarda la lista actualizada de animes en el archivo
    res.json({ message: "Anime actualizado exitosamente", anime: updatedAnime }); // Responde con éxito y el anime actualizado
});

// Eliminar un anime por ID
router.delete("/:id", async (req, res) => { // Define una ruta DELETE para eliminar un anime por ID
    const animes = await readAnimes(); // Lee los animes existentes
    const newAnimes = animes.filter(anime => anime.id !== parseInt(req.params.id)); // Filtra los animes para excluir el anime con el ID proporcionado
    if (animes.length === newAnimes.length) { // Verifica si el anime fue encontrado y eliminado
        return res.status(404).json({ message: "Anime no encontrado" }); // Responde con un error si el anime no se encuentra
    }
    await writeAnimes(newAnimes); // Guarda la lista actualizada de animes en el archivo
    res.json({ message: "Anime eliminado exitosamente" }); // Responde con éxito
});

export default router; // Exporta el router para que pueda ser utilizado en otros módulos

