const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    cantidad: Number,
    categoria: String
});

module.exports = mongoose.model('Product', productSchema);