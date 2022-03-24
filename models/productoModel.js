// Creación del producto
const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const objetoProductoSchema = {
    titulo: String,
    autor: String,
    genero: String,
    ano: String,
    numDisco: String,
    precio: Number,
    imgUrl: String,
};

const productoSchema = mongoose.Schema(objetoProductoSchema, {versionKey: false})

productoSchema.plugin(AutoIncrement, {inc_field: 'id_vinilo'});

const Producto = mongoose.model("productos", productoSchema);


// para exportar
module.exports = Producto;



