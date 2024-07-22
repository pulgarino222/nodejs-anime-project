import { Router } from 'express'; // Importa el Router de Express para manejar rutas
import { promises as fs } from 'fs'; // Importa el módulo de promesas de fs para operaciones de archivo asíncronas
import path from 'path'; // Importa el módulo path para manipulación de rutas de archivo
import { fileURLToPath } from 'url'; // Importa fileURLToPath para convertir URLs de archivo en rutas de archivo

const router = Router(); // Crea una instancia de Router para definir rutas
const _filename = fileURLToPath(import.meta.url); // Obtiene la ruta del archivo actual
const _dirname = path.dirname(_filename); // Obtiene el directorio del archivo actual
const charactersFilePath = path.join(_dirname, "../../data/characters.json"); // Ruta al archivo JSON de personajes
const animesFilePath = path.join(_dirname, "../../data/animes.json"); // Ruta al archivo JSON de animes

// Leer los personajes desde el archivo
async function readCharacters() {
    try {
        const charactersData = await fs.readFile(charactersFilePath); // Lee el archivo de personajes
        return JSON.parse(charactersData); // Parsea el contenido del archivo y lo devuelve como objeto JSON
    } catch (error) {
        throw new Error(`Error en la promesa ${error.message}`); // Maneja errores en la lectura del archivo
    }
}

// Leer los animes desde el archivo
async function readAnimes() {
    try {
        const animesData = await fs.readFile(animesFilePath); // Lee el archivo de animes
        return JSON.parse(animesData); // Parsea el contenido del archivo y lo devuelve como objeto JSON
    } catch (error) {
        throw new Error(`Error en la promesa ${error.message}`); // Maneja errores en la lectura del archivo
    }
}

// Escribir personajes en el archivo
async function writeCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2)); // Escribe el contenido de personajes en el archivo en formato JSON
    } catch (error) {
        throw new Error(`Error en la promesa ${error.message}`); // Maneja errores en la escritura del archivo
    }
}

// Crear un nuevo personaje
router.post("/", async (req, res) => { // Define una ruta POST para crear un nuevo personaje
    const characters = await readCharacters(); // Lee los personajes existentes
    const animes = await readAnimes(); // Lee los animes existentes

    const anime = animes.find(anime => anime.id === req.body.animeId); // Busca el anime con el ID proporcionado
    if (!anime) { // Verifica si el anime existe
        return res.status(400).json({ message: "ID de anime no válido" }); // Responde con un error si el anime no existe
    }

    const newCharacter = { // Crea un nuevo objeto de personaje
        id: characters.length + 1, // Asigna un ID único
        name: req.body.name, // Asigna el nombre del personaje
        animeId: req.body.animeId // Asigna el ID del anime asociado con el personaje
    };
    characters.push(newCharacter); // Añade el nuevo personaje a la lista de personajes
    await writeCharacters(characters); // Guarda la lista actualizada de personajes en el archivo
    res.status(201).json({ message: "Personaje creado exitosamente", character: newCharacter }); // Responde con éxito y el nuevo personaje
});

// Obtener todos los personajes con datos del anime
router.get("/", async (req, res) => { // Define una ruta GET para obtener todos los personajes
    const characters = await readCharacters(); // Lee los personajes existentes
    const animes = await readAnimes(); // Lee los animes existentes
    const charactersWithAnimes = characters.map(character => { // Mapea los personajes para incluir el título del anime
        const anime = animes.find(anime => anime.id === character.animeId); // Busca el anime asociado con el personaje
        return {
            ...character, // Incluye todas las propiedades del personaje
            animeId: character.animeId, // Incluye el ID del anime
            animeTitle: anime ? anime.title : 'Desconocido' // Incluye el título del anime o 'Desconocido' si no se encuentra
        };
    });
    res.json(charactersWithAnimes); // Responde con la lista de personajes y títulos de animes
});

// Obtener un personaje por ID con datos del anime
router.get("/:id", async (req, res) => { // Define una ruta GET para obtener un personaje por ID
    const characters = await readCharacters(); // Lee los personajes existentes
    const animes = await readAnimes(); // Lee los animes existentes
    const character = characters.find(character => character.id === parseInt(req.params.id)); // Busca el personaje por ID
    if (!character) { // Verifica si el personaje existe
        return res.status(404).json({ message: "Personaje no encontrado" }); // Responde con un error si el personaje no se encuentra
    }
    const anime = animes.find(anime => anime.id === character.animeId); // Busca el anime asociado con el personaje
    res.json({ // Responde con el personaje y el título del anime
        ...character, // Incluye todas las propiedades del personaje
        animeId: character.animeId, // Incluye el ID del anime
        animeTitle: anime ? anime.title : 'Desconocido' // Incluye el título del anime o 'Desconocido' si no se encuentra
    });
});

// Actualizar un personaje por ID
router.put("/:id", async (req, res) => { // Define una ruta PUT para actualizar un personaje por ID
    const characters = await readCharacters(); // Lee los personajes existentes
    const animes = await readAnimes(); // Lee los animes existentes

    const anime = animes.find(anime => anime.id === req.body.animeId); // Busca el anime con el ID proporcionado
    if (!anime) { // Verifica si el anime existe
        return res.status(400).json({ message: "ID de anime no válido" }); // Responde con un error si el anime no existe
    }

    const characterIndex = characters.findIndex(character => character.id === parseInt(req.params.id)); // Encuentra el índice del personaje que se va a actualizar
    if (characterIndex === -1) { // Verifica si el personaje existe
        return res.status(404).json({ message: 'Personaje no existe' }); // Responde con un error si el personaje no se encuentra
    }
    const updatedCharacter = { // Crea un objeto de personaje actualizado
        ...characters[characterIndex], // Incluye todas las propiedades del personaje existente
        name: req.body.name, // Actualiza el nombre del personaje
        animeId: req.body.animeId // Actualiza el ID del anime asociado con el personaje
    };
    characters[characterIndex] = updatedCharacter; // Reemplaza el personaje existente con el actualizado
    await writeCharacters(characters); // Guarda la lista actualizada de personajes en el archivo
    res.json({ message: "Personaje actualizado exitosamente", character: updatedCharacter }); // Responde con éxito y el personaje actualizado
});

// Eliminar un personaje por ID
router.delete("/:id", async (req, res) => { // Define una ruta DELETE para eliminar un personaje por ID
    const characters = await readCharacters(); // Lee los personajes existentes
    const newCharacters = characters.filter(character => character.id !== parseInt(req.params.id)); // Filtra los personajes para excluir el personaje con el ID proporcionado
    if (characters.length === newCharacters.length) { // Verifica si el personaje fue encontrado y eliminado
        return res.status(404).json({ message: "Personaje no encontrado" }); // Responde con un error si el personaje no se encuentra
    }
    await writeCharacters(newCharacters); // Guarda la lista actualizada de personajes en el archivo
    res.json({ message: "Personaje eliminado exitosamente" }); // Responde con éxito
});

export default router; // Exporta el router para que pueda ser utilizado en otros módulos
