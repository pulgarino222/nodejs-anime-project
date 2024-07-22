import { Router } from 'express'; // Importa el Router de Express para manejar rutas
import { promises as fs } from 'fs'; // Importa el módulo de promesas de fs para operaciones de archivo asíncronas
import path from 'path'; // Importa el módulo path para manipulación de rutas de archivo
import { fileURLToPath } from 'url'; // Importa fileURLToPath para convertir URLs de archivo en rutas de archivo

const router = Router(); // Crea una instancia de Router para definir rutas
const _filename = fileURLToPath(import.meta.url); // Obtiene la ruta del archivo actual
const _dirname = path.dirname(_filename); // Obtiene el directorio del archivo actual
const studiosFilePath = path.join(_dirname, "../../data/studios.json"); // Ruta al archivo JSON de estudios

// Leer los estudios desde el archivo
async function readStudios() {
    try {
        const studiosData = await fs.readFile(studiosFilePath); // Lee el archivo de estudios
        return JSON.parse(studiosData); // Parsea el contenido del archivo y lo devuelve como objeto JSON
    } catch (error) {
        throw new Error(`Error en la promesa ${error.message}`); // Maneja errores en la lectura del archivo
    }
}

// Escribir estudios en el archivo
async function writeStudios(studios) {
    try {
        await fs.writeFile(studiosFilePath, JSON.stringify(studios, null, 2)); // Escribe el contenido de estudios en el archivo en formato JSON
    } catch (error) {
        throw new Error(`Error en la promesa ${error.message}`); // Maneja errores en la escritura del archivo
    }
}

// Crear un nuevo estudio
router.post("/", async (req, res) => {
    const studios = await readStudios(); // Lee los estudios existentes
    const newStudio = { // Crea un nuevo objeto de estudio
        id: studios.length + 1, // Asigna un ID único
        name: req.body.name, // Asigna el nombre del estudio
        location: req.body.location // Asigna la ubicación del estudio
    };
    studios.push(newStudio); // Añade el nuevo estudio a la lista de estudios
    await writeStudios(studios); // Guarda la lista actualizada de estudios en el archivo
    res.status(201).json({ message: "Estudio creado exitosamente", studio: newStudio }); // Responde con éxito y el nuevo estudio
});

// Obtener todos los estudios
router.get("/", async (req, res) => {
    const studios = await readStudios(); // Lee los estudios existentes
    res.json(studios); // Responde con la lista de estudios
});

// Obtener un estudio por ID
router.get("/:id", async (req, res) => {
    const studios = await readStudios(); // Lee los estudios existentes
    const studio = studios.find(studio => studio.id === parseInt(req.params.id)); // Busca el estudio por ID
    if (!studio) { // Verifica si el estudio existe
        return res.status(404).json({ message: "Estudio no encontrado" }); // Responde con un error si el estudio no se encuentra
    }
    res.json(studio); // Responde con el estudio encontrado
});

// Actualizar un estudio por ID
router.put("/:id", async (req, res) => {
    const studios = await readStudios(); // Lee los estudios existentes
    const studioIndex = studios.findIndex(studio => studio.id === parseInt(req.params.id)); // Encuentra el índice del estudio que se va a actualizar
    if (studioIndex === -1) { // Verifica si el estudio existe
        return res.status(404).json({ message: 'Estudio no encontrado' }); // Responde con un error si el estudio no se encuentra
    }
    const updatedStudio = { // Crea un objeto de estudio actualizado
        ...studios[studioIndex], // Incluye todas las propiedades del estudio existente
        name: req.body.name, // Actualiza el nombre del estudio
        location: req.body.location // Actualiza la ubicación del estudio
    };
    studios[studioIndex] = updatedStudio; // Reemplaza el estudio existente con el actualizado
    await writeStudios(studios); // Guarda la lista actualizada de estudios en el archivo
    res.json({ message: "Estudio actualizado exitosamente", studio: updatedStudio }); // Responde con éxito y el estudio actualizado
});

// Eliminar un estudio por ID
router.delete("/:id", async (req, res) => {
    const studios = await readStudios(); // Lee los estudios existentes
    const newStudios = studios.filter(studio => studio.id !== parseInt(req.params.id)); // Filtra los estudios para excluir el estudio con el ID proporcionado
    if (studios.length === newStudios.length) { // Verifica si el estudio fue encontrado y eliminado
        return res.status(404).json({ message: "Estudio no encontrado" }); // Responde con un error si el estudio no se encuentra
    }
    await writeStudios(newStudios); // Guarda la lista actualizada de estudios en el archivo
    res.json({ message: "Estudio eliminado exitosamente" }); // Responde con éxito
});

export default router; // Exporta el router para que pueda ser utilizado en otros módulos
