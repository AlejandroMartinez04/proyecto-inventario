require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
const cors = require('cors');
const Product = require('./models/Product');

const app = express();
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conectado a MongoDB');
    })
    .catch(error => console.error('Error conectando a MongoDB:', error));

app.get('/', async (req, res) => {
    try {
        const products = await Product.find().lean();
        const builder = new xml2js.Builder();
        const xml = builder.buildObject({
            inventario: {
                producto: products.map(p => ({
                    nombre: p.nombre,
                    precio: p.precio,
                    cantidad: p.cantidad,
                    categoria: p.categoria
                }))
            }
        });
        const totalValor = products.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const categorias = [...new Set(products.map(p => p.categoria))];
        res.render('index', { products, xml, totalValor, categorias });
    } catch (error) {
        console.error('Error en la ruta /:', error); // Log del error
        res.status(500).send('Algo salió mal. Por favor intenta de nuevo más tarde.');
    }
});

app.get('/productos/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        res.json(product);
    } catch (error) {
        console.error('Error en la ruta /productos/:id:', error); // Log del error
        res.status(500).send('Algo salió mal. Por favor intenta de nuevo más tarde.');
    }
});

app.post('/productos/:id', async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/');
    } catch (error) {
        console.error('Error en la ruta /productos/:id (POST):', error); // Log del error
        res.status(500).send('Algo salió mal. Por favor intenta de nuevo más tarde.');
    }
});

app.post('/productos', async (req, res) => {
    const { nombre, precio, cantidad, categoria } = req.body;
    try {
        const product = new Product({ nombre, precio, cantidad, categoria });
        await product.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error en la ruta /productos (POST):', error); // Log del error
        res.status(500).send('Algo salió mal. Por favor intenta de nuevo más tarde.');
    }
});

app.post('/productos/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        console.error('Error en la ruta /productos/delete/:id:', error); // Log del error
        res.status(500).send('Algo salió mal. Por favor intenta de nuevo más tarde.');
    }
});

app.use((err, req, res, next) => {
    console.error('Error global:', err.stack);
    res.status(500).send('Algo salió mal. Por favor intenta de nuevo más tarde.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en el puerto ${PORT}`));