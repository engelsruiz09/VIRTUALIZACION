const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const winston = require('winston');
const PORT = process.env.PORT || 8080;

// Configuración de winston
// Configuración de winston modificada para usar el puerto en los nombres de archivo
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: `user-service-port-${PORT}` },
  transports: [
    new winston.transports.File({ filename: `logs/error-${PORT}.log`, level: 'error' }),
    new winston.transports.File({ filename: `logs/combined-${PORT}.log` }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const app = express();
const db = new sqlite3.Database(':memory:');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Crear tabla de usuarios
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
});

// Middleware para medir el tiempo de procesamiento
app.use((req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationInMilliseconds.toLocaleString()} ms`);
  });
  
  next();
});

function getDurationInMilliseconds(start) {
  const NS_PER_SEC = 1e9; // Convert to nanoseconds
  const NS_TO_MS = 1e6; // Convert to milliseconds
  const diff = process.hrtime(start);
  
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
}

// Registro de usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) {
      logger.error('Error al crear el usuario: ${err.message}');
      res.status(400).send("No se pudo crear el usuario");
      return;
    }
    logger.info(`Usuario creado exitosamente con ID: ${this.lastID}`);
    res.status(201).send({ message: "Usuario creado exitosamente", userId: this.lastID });
  });
});

// Login de usuario
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      logger.error('Error al buscar el usuario: ${err.message}');
      res.status(500).send("Error al buscar el usuario");
      return;
    }
    if (!user) {
      logger.error('Login fallido: Usuario no encontrado', { username });
      res.status(404).send("Usuario no encontrado");
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      logger.info(`Login exitoso para el usuario: ${username}`);
      res.send({ message: "Login exitoso" });
    } else {
      logger.warn('Login fallido: Contraseña incorrecta', { username });
      res.status(401).send("Contraseña incorrecta");
    }
  });
});

// Ruta para mostrar el formulario de registro
app.get('/register', (req, res) => {
  res.render('register');
});

// Ruta para mostrar el formulario de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Iniciar el servidor
//const PORT = 8080;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
});
