// Creación del usuario
const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);


const objetoUsuarioSchema = {
    nombre: String,
    apellidos: String,
    email: String,
    pass: String,
    dni: String,
    telefono: String,
    direccion: String,
    cp: String,
    poblacion: String,
    admin: Boolean
};

const usuarioSchema = mongoose.Schema(objetoUsuarioSchema, {versionKey: false});

usuarioSchema.plugin(AutoIncrement, {inc_field: 'id_usuario'});

const Usuario = mongoose.model("usuarios", usuarioSchema);


// para exportar
module.exports = Usuario;



