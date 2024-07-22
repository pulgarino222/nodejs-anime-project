// Importamos Express para manejar el servidor y las rutas
import express from "express";
// Importamos los routers que manejarán las rutas de la API
import animeRouter from "./routes/animes.js";
import studioRouter from "./routes/studios.js";
import directorRouter from "./routes/directors.js";
import characterRouter from "./routes/characters.js";
// Importamos el middleware personalizado para manejar errores
import errorHandler from "./middlewares/errorHandler.js";
// Importamos y configuramos dotenv para gestionar variables de entorno
import dotenv from "dotenv";
dotenv.config(); // Carga las variables de entorno del archivo .env

// Creamos una instancia de la aplicación Express
const app = express();

// Definimos el puerto en el que el servidor escuchará las peticiones
const PORT = process.env.PORT || 3000; // Usa el puerto definido en .env o el 3000 por defecto

// Middleware para analizar cuerpos de solicitudes en formato JSON
app.use(express.json()); // Permite que la aplicación lea datos JSON en las solicitudes

// Configuramos las rutas de la API
app.use("/animes", animeRouter); // Las rutas bajo "/animes" serán manejadas por animeRouter
app.use("/studios", studioRouter); // Las rutas bajo "/studios" serán manejadas por studioRouter
app.use("/directors", directorRouter); // Las rutas bajo "/directors" serán manejadas por directorRouter
app.use("/characters", characterRouter); // Las rutas bajo "/characters" serán manejadas por characterRouter
// app.use("/personajes", personajesRouter); // Comentado, se puede usar si se necesita una ruta para personajes en español

// Middleware para manejar errores globalmente
app.use(errorHandler); // Aplica el middleware de manejo de errores definido en errorHandler.js

// Iniciamos el servidor y hacemos que escuche en el puerto definido
app.listen(PORT, () => {
    // Mensaje en consola indicando que el servidor está corriendo
    console.log(`Server running at http://localhost:${PORT}/`); // Muestra la URL donde está disponible el servidor
});
