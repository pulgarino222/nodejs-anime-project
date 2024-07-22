import { Router } from 'express'; // Importa el Router de Express para manejar rutas
import { promises as fs } from 'fs'; // Importa el módulo de promesas de fs para operaciones de archivo asíncronas
import path from 'path'; // Importa el módulo path para manipulación de rutas de archivo
import { fileURLToPath } from 'url'; // Importa fileURLToPath para convertir URLs de archivo en rutas de archivo

const router = Router(); // Crea una instancia de Router para definir rutas
const _filename = fileURLToPath(import.meta.url); // Obtiene la ruta del archivo actual
const _dirname = path.dirname(_filename); // Obtiene el directorio del archivo actual
const directorsFilePath = path.join(_dirname, "../../data/directors.json"); // Ruta al archivo JSON de directores

// Leer los directores desde el archivo
async function readDirectors() {
    try {
        const directorsData = await fs.readFile(directorsFilePath); // Lee el archivo de directores
        return JSON.parse(directorsData); // Parsea el contenido del archivo y lo devuelve como objeto JSON
    } catch (error) {
        throw new Error(`Error en la promesa ${error.message}`); // Maneja errores en la lectura del archivo
    }
}

// Escribir directores en el archivo
async function writeDirectors(directors) {
    try {
        await fs.writeFile(directorsFilePath, JSON.stringify(directors, null, 2)); // Escribe el contenido de directores en el archivo en formato JSON
    } catch (error) {
        throw new Error(`Error en la promesa ${error.message}`); // Maneja errores en la escritura del archivo
    }
}

// Crear un nuevo director
router.post("/", async (req, res) => {
    const directors = await readDirectors(); // Lee los directores existentes
    const newDirector = { // Crea un nuevo objeto de director
        id: directors.length + 1, // Asigna un ID único
        name: req.body.name // Asigna el nombre del director
    };
    directors.push(newDirector); // Añade el nuevo director a la lista de directores
    await writeDirectors(directors); // Guarda la lista actualizada de directores en el archivo
    res.status(201).json({ message: "Director creado exitosamente", director: newDirector }); // Responde con éxito y el nuevo director
});

// Obtener todos los directores
router.get("/", async (req, res) => {
    const directors = await readDirectors(); // Lee los directores existentes
    res.json({ directors }); // Responde con la lista de directores
});

// Obtener un director por ID
router.get("/:id", async (req, res) => {
    const directors = await readDirectors(); // Lee los directores existentes
    const director = directors.find(director => director.id === parseInt(req.params.id)); // Busca el director por ID
    if (!director) { // Verifica si el director existe
        return res.status(404).json({ message: "Director no encontrado" }); // Responde con un error si el director no se encuentra
    }
    res.json({ director }); // Responde con el director encontrado
});

// Actualizar un director por ID
router.put("/:id", async (req, res) => {
    const directors = await readDirectors(); // Lee los directores existentes
    const directorIndex = directors.findIndex(director => director.id === parseInt(req.params.id)); // Encuentra el índice del director que se va a actualizar
    if (directorIndex === -1) { // Verifica si el director existe
        return res.status(404).json({ message: 'Director no encontrado' }); // Responde con un error si el director no se encuentra
    }
    const updatedDirector = { // Crea un objeto de director actualizado
        ...directors[directorIndex], // Incluye todas las propiedades del director existente
        name: req.body.name // Actualiza el nombre del director
    };
    directors[directorIndex] = updatedDirector; // Reemplaza el director existente con el actualizado
    await writeDirectors(directors); // Guarda la lista actualizada de directores en el archivo
    res.json({ message: "Director actualizado exitosamente", director: updatedDirector }); // Responde con éxito y el director actualizado
});

// Eliminar un director por ID
router.delete("/:id", async (req, res) => {
    const directors = await readDirectors(); // Lee los directores existentes
    const newDirectors = directors.filter(director => director.id !== parseInt(req.params.id)); // Filtra los directores para excluir el director con el ID proporcionado
    if (directors.length === newDirectors.length) { // Verifica si el director fue encontrado y eliminado
        return res.status(404).json({ message: "Director no encontrado" }); // Responde con un error si el director no se encuentra
    }
    await writeDirectors(newDirectors); // Guarda la lista actualizada de directores en el archivo
    res.json({ message: "Director eliminado exitosamente" }); // Responde con éxito
});

export default router; // Exporta el router para que pueda ser utilizado en otros módulos
