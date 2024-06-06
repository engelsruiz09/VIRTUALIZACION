const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


app.get('/items', (req, res) => {
    db.query('SELECT * FROM MY_CRUD')
      .then(([rows]) => res.json(rows))
      .catch(err => res.status(500).json(err));
});

app.post('/items', (req, res) => {
const { nombre, edad, carrera } = req.body;
db.query('INSERT INTO MY_CRUD (nombre, edad, carrera) VALUES (?, ?, ?)', [nombre, edad, carrera])
    .then(() => res.status(201).send('Item creado'))
    .catch(err => res.status(500).json(err));
});

app.put('/items/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, edad, carrera } = req.body;
    
    db.query('UPDATE MY_CRUD SET nombre = ?, edad = ?, carrera = ? WHERE id = ?', [nombre, edad, carrera, id])
      .then(() => res.send(`Item con id ${id} actualizado`))
      .catch(err => res.status(500).json(err));
  });

app.delete('/items/:id', (req, res) => {
const { id } = req.params;

db.query('DELETE FROM MY_CRUD WHERE id = ?', [id])
    .then(() => res.send(`Item con id ${id} eliminado`))
    .catch(err => res.status(500).json(err));
});
