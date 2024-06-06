const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const authserver = express();
const db = new sqlite3.Database(':memory:');

authserver.set('view engine', 'ejs');
authserver.set('views', './views');

authserver.use(bodyParser.urlencoded({ extended: false }));
authserver.use(bodyParser.json());

// Crear tabla de usuarios
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
});

// Registro de usuario
// Ruta para registro de usuario
authserver.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) {
      console.error('Error al crear el usuario:', err.message);
      res.status(400).send("No se pudo crear el usuario");
      return;
    }
    console.log(`Usuario creado exitosamente con ID: ${this.lastID}`);
    res.status(201).send({ message: "Usuario creado exitosamente", userId: this.lastID });
  });
});

// Login de usuario
// Ruta para login de usuario
authserver.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        console.error('Error al buscar el usuario:', err.message);
        res.status(500).send("Error al buscar el usuario");
        return;
      }
      if (!user) {
        console.log('Login fallido: Usuario no encontrado');
        res.status(404).send("Usuario no encontrado");
        return;
      }
  
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        console.log(`Login exitoso para el usuario: ${username}`);
        res.send({ message: "Login exitoso" });
      } else {
        console.log('Login fallido: Contraseña incorrecta');
        res.status(401).send("Contraseña incorrecta");
      }
    });
  });

// Ruta para mostrar el formulario de registro
authserver.get('/register', (req, res) => {
    res.render('register');
});

// Ruta para mostrar el formulario de login
authserver.get('/login', (req, res) => {
    res.render('login');
});


// Iniciar el servidor
const AUTH_PORT = 5000;
authserver.listen(AUTH_PORT, () => {
    console.log(`Servidor de autenticación corriendo en http://localhost:${AUTH_PORT}`);
  });
