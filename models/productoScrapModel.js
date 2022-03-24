const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const objetoProductoSchemaScrap = {
    titulo: String,
    autor: String,
    genero: String,
    ano: String,
    numDisco: String,
    precio: String,
    imgUrl: String,
};

const productoSchemaScrap = mongoose.Schema(objetoProductoSchemaScrap, {versionKey: false})

productoSchemaScrap.plugin(AutoIncrement, {inc_field: 'id_viniloScrap'});

const ProductoScrap = mongoose.model("productos_scrapeados", productoSchemaScrap);
module.exports = ProductoScrap