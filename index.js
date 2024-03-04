const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors")
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
app.use(cors())
const productosPath = 'productos.json';
// Verificar si el archivo JSON ya existe
if (!fs.existsSync(productosPath)) {
    // Si no existe, inicializar con un array vacío
    fs.writeFileSync(productosPath, '[]', 'utf-8');
}

app.use(bodyParser.json());
const getNextProductId = (data) => {
    const maxId = data.reduce((max, producto) => (producto.id > max ? producto.id : max), 0);
    return maxId + 1;
};
app.post('/productos', (req, res) => {
    const { nombre, descripcion, categoria, proveedor, costo, peso } = req.body;

    if (!nombre || !descripcion || !categoria || !proveedor || !costo || !peso) {
        res.status(400).json({
            message: 'Te falta alguno de los elementos necesarios o has escrito tu solicitud de manera incorrecta. Favor de verificar.'
        });
    } else {
        const fecha_creacion = new Date().toISOString();
        const data = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
        const id = getNextProductId(data);
        const nuevoProducto = {
            id,
            nombre,
            descripcion,
            categoria,
            proveedor,
            costo,
            peso,
            fecha_creacion,
        };
        data.push(nuevoProducto);
        fs.writeFileSync(productosPath, JSON.stringify(data, null, 2), 'utf-8');
        res.status(201).json({ message: 'Producto agregado exitosamente.' });
    }
});

app.get('/productos', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
});

app.get('/productos/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
        const productoEncontrado = data.find(producto => producto.id === parseInt(id));

        if (!productoEncontrado) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.json(productoEncontrado);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al obtener el producto.' });
    }
});
app.get('/productos/categoria/:categoria', (req, res) => {
    try {
        const { categoria } = req.params;
        const data = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
        const productosFiltrados = data.filter(producto => producto.categoria === categoria);

        res.json(productosFiltrados);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
});
app.post('/productos/:id', (req, res) => {
    res.status(400).json({ error: "Los POST no llevan parámetros!! verifica por favor tu ruta y el tipo de petición que estás realizando" });
});

app.get('/', (req, res) => {
    res.status(200).send("Api de Productos.<p>Get: <li>/productos</li> <li>/productos:id</li> <li>/productos/categorias/:cat</li> <p>Post:<li>/productos</li><p>Parámetros obligatorios: <li>nombre</li><li>descripcion</li><li>categoria</li> <li>proveedor(tu nombre)</li><li>costo</li><li>peso (en g)</li>");
});

app.listen(port, () => {
    console.log(`Servidor ejecutandose en puerto ${port}`);
});