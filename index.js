const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const cors = require("cors")
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
const dbPath = 'productos.db';

// Verificar si la base de datos ya existe
if (!fs.existsSync(dbPath)) {
  // Si no existe, crear la base de datos y la tabla
  const db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run(`CREATE TABLE productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      descripcion TEXT,
      categoria TEXT,
      proveedor TEXT,
      costo REAL,
      peso REAL,
      fecha_creacion TEXT
    )`);
  });
  db.close();
}
  const db = new sqlite3.Database(dbPath);

app.use(bodyParser.json());

//Agregar un nuevo producto
app.post('/productos', (req, res) => {
  const { nombre, descripcion, categoria, proveedor, costo, peso } = req.body;
  if (!nombre || !descripcion || !categoria || !proveedor || !costo || !peso) {
    res.status(400).json({
      message: 'Te falta alguno de los elementos necesarios o has escrito tu solicitud de manera incorrecta. Favor de verificar.'
    });
  } else {
  
  const fecha_creacion = new Date().toISOString();

  db.run(
    `INSERT INTO productos (nombre, descripcion, categoria, proveedor, costo, peso, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nombre, descripcion, categoria, proveedor, costo, peso, fecha_creacion],
    (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Error al agregar el producto.' });
      }

      res.status(201).json({ message: 'Producto agregado exitosamente.' });
    }
  );
  }
});

//Obtenemos todos los productos
app.get('/productos', (req, res) => {
  db.all(`SELECT * FROM productos`, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Error al obtener los productos.' });
    }

    res.json(rows);
  });
});

app.get('/', (req, res) => {
  res.status(200).send("Rutas con soporte: /productos, /productos/:id, /productos/categoria/:cat, POST/productos")
});

//buscar un producto por ID
app.get('/productos/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM productos WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Error al obtener el producto.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json(row);
  });
});

//Endpoint filtrar por categoria
app.get('/productos/categoria/:categoria', (req, res) => {
  const { categoria } = req.params;

  db.all(`SELECT * FROM productos WHERE categoria = ?`, [categoria], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Error al obtener los productos.' });
    }

    res.json(rows);
  });
});

//puerto de escucha
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
