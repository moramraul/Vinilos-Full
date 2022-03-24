// Creación de la compra
const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const objetoCompraSchema = {
    id_usuario: String,
    productos: Array,
    created: Date,
};

const compraSchema = mongoose.Schema(objetoCompraSchema, {versionKey: false});

compraSchema.plugin(AutoIncrement, {inc_field: 'id_compra'});

const Compra = mongoose.model("compras", compraSchema);
  

// para exportar
module.exports = Compra;




