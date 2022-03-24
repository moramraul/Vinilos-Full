const mongoose = require("mongoose");
const Producto = require("../models/productoModel");
const ProductoScrap = require("../models/productoScrapModel");
const Usuario = require("../models/usuarioModel");
const Compra = require("../models/compraModel");
const scrapping = require("../scrapper")
const { createInvoice } = require("../pdfkit/createInvoice")
const nodemailer = require("nodemailer");

// ! REQUIRE de BCRYPT
const bcrypt = require('bcrypt');
const { redirect } = require("express/lib/response");
const { openDelimiter } = require("ejs");
const saltRounds = 10;



const pages = {
    addDisco: (req, res) => {
        insertarDisco(req,res);
    },

    deleteDisco: (req, res) => {
        borrarDisco(req);
    },

    updateDisco: (req, res) => {
        modificarDisco(req);
    },

    home: (req, res) => {
        let infoUser = saveSesionStart();
        let estado = "inicio";
        res.render("pages/home", { info: JSON.stringify(infoUser) });
    },

    verHome: (req, res) => {
        res.render("pages/home2");
    },

    verTienda: async (req, res) => {
        let infoDiscos = await obtenerInfoVinilos();
        let infoDiscosScrapping = await scrapping.addRecordsWeb(7);
        let infoBDScrapping = await obtenerInfoVinilosScrapeadosAll();
        res.render("pages/tienda", { infoVinilos: infoDiscos, infoDiscosScrapeados: infoDiscosScrapping, infoVinilos3: infoBDScrapping })

    },

    verBusqueda: async (req, res) => {
        let infoDiscos = await obtenerVinilosGenero(req.body.generosCheckados);
        res.render("pages/busqueda", { infoVinilos: infoDiscos })
    },

    verBusquedaTitulo: async (req, res) => {
        let infoTitulo = await obtenerViniloTitulo(req.body.tituloIntroducido)
        res.render("pages/busquedaTitulo", { infoVinilos2: infoTitulo })
    },
    modificarPerfil: (req, res) => {
        res.render("pages/modDatos")
    },

    updateUser: async (req, res) => {
        let updateUser = await modificarUsuario(req);
        res.render("pages/modDatos");
    },
    //! Comprabar lo hice a ciegas !!!!!
    historialNoLogin: async (req, res) => {
        //Busca dni por email
        let infoUser = await busquedaUsuarioEmail(req.body.email);
        console.log(infoUser[0]);
        //SI no existe o lo puso mal
        if (infoUser[0] === undefined) {
            console.log("Revisa tu correo, no existe ese email");
        } else {
            //verifica si ese email tiene ese dni el mismo introducido
            let mismoDni = infoUser[0].dni == req.body.dni;
            if (mismoDni) {
                //Recoge las compras por su id_usuario
                let infoCompras = await Compra.find({ id_usuario: infoUser[0].id_usuario });
                res.render("pages/historial", { infoCompras: infoCompras });
            } else {
                console.log("DNI no corresponde con el guardado");
            }
        }
    },

    historial: async (req, res) => {
        let infoUser = await busquedaUsuarioEmail(req.body.email);
        console.log(infoUser[0].id_usuario);

        let infoCompras = await Compra.find({ id_usuario: infoUser[0].id_usuario });
        console.log(infoCompras);
        res.render("pages/historial", { infoCompras: infoCompras });
    },


    verPerfil: async (req, res) => {
        let infoDiscos = await obtenerInfoVinilosRandom();
        res.render("pages/perfil", { infoVinilos: infoDiscos });
    },

    verProducto: async (req, res) => {

        let infoDisco = await obtenerInfoProducto(req.body.id_vinilo);
        let infoBDScrapping = await obtenerInfoVinilosScrapeados(req.body.id_viniloScrap);
        res.render("pages/producto", {infoProducto: infoDisco, infoProducto2: infoBDScrapping});

    },

    buscarHist: (req, res) => {
        res.render("pages/buscarHist");
    },

    verCarrito: async (req, res) => {
        let arrayProductos = await obtenerProductosCarrito(req.body.carritoData);
        if (typeof (arrayProductos) === "string") {
            res.render("pages/carritoVacio");
        } else {
            res.render("pages/carrito", { infoProductos: arrayProductos });
        }
    },


    //Al pinchar en el nav para volver
    volverAdmin: async (req, res) => {
        let infoUser = req.body.infoAdmin;
        let infoDiscos = await obtenerInfoVinilos();
        let infoDiscosScrapping = await scrapping.addRecordsDB(req.body.insertScrap)
        res.render("pages/admin", { info: infoUser, infoDisco: infoDiscos, infoDiscosScrapeados: infoDiscosScrapping });
    },
    scrapAdmin: async (req, res) => {
        let infoUser = req.body.infoAdmin;
        let infoDiscosScrapping = await scrapping.addRecordsDB(req.body.insertScrap)
        res.render("pages/scrapAdmin", { info: infoUser, infoDiscosScrapeados: infoDiscosScrapping });
    },
    carritoConfirmado: async (req, res) => {
        let userInfo = JSON.parse(req.body.userInfo);
        let idsVinilos = req.body.idsCompra;
        if (userInfo.nombre === "") {
            // Usuario NO registrado

            res.render("pages/datosEnvio");

        } else {
            // Usuario registrado
            let insertarEnCompras = await insertarCompra(idsVinilos, userInfo);

            res.render("pages/buyConfirm");
        }

    },
    enviarMail: (req, res) => {
        let email = req.body.email
        let pass = req.body.password
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: email,
                pass: pass
            }
        });
        var mailOptions = {
            from: "Remitente",
            to: "hola@vinilosfull.com",
            subject: "Factura de VinilosFull",
            // text: "¡Hola! Gracias por comprar en VinilosFull. Aquí tienes la factura que nos has pedido de tu compra. Gracias por confiar en nosotros.",
            html: '<h1>¡Hola!<h2><br/><h2>Gracias por comprar en VinilosFull. Aquí tienes la factura que nos has pedido de tu compra. Gracias por confiar en nosotros.</h2>',
            attachments:[{
                filename:"factura_vinilosFull.pdf",
                path:"./public/factura_vinilosFull.pdf",
                contentType: 'application/pdf'
            }]
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Email enviado.")
            }
        })
    },
    submitDatosEnvio: async (req, res) => {

        const existeDni = await busquedaUsuarioDni(req.body.dni);
        if ((existeDni) == null) {
            let usuario = insertarUsuarioDatosEnvio(req.body.nombre, req.body.apellidos, req.body.email, "", req.body.dni, req.body.direccion, req.body.cp, req.body.poblacion, req.body.tlf);
            res.render("pages/pasarela", {info : JSON.stringify(usuario)})
        } else {

            res.render("pages/pasarela", {info : JSON.stringify(existeDni)})
        }
    },
    datosEnvio2: async (req, res) => {
        let infoUser = JSON.parse(req.body.datos);
        let infoProductos = req.body.productos;
        console.log(infoProductos)
        let returnInfoUserConId = await busquedaUsuarioDni(infoUser.dni)
        let insertarEnCompras = await insertarCompra(infoProductos, returnInfoUserConId);
        res.render("pages/buyConfirmNoUser", { info: JSON.stringify(returnInfoUserConId) });
    },
    viewRegister: (req, res) => {
        let estado = "inicio";
        // res.render("pages/registerLogin");
        res.render("pages/registerLogin", { validation: estado });

    },

    verFactura: async (req, res) => {
        // console.log(req.body.infoUser);
        let infoComprador = JSON.parse(req.body.infoUser);
        let idsProductosCompra = req.body.infoProductos;
        let infoProductosFactura = await obtenerInfoProductosFactura(idsProductosCompra)

        let productos = [];
        for (let i = 0; i < infoProductosFactura.length - 1; i++) {
            const prod = {
                producto: infoProductosFactura[i][0].autor,
                titulo: infoProductosFactura[i][0].titulo,
                cantidad: 1,
                precio: infoProductosFactura[i][0].precio * 100
            }
            productos.push(prod)
        }

        const factura = {
            shipping: {
                nombre: infoComprador.nombre + " " + infoComprador.apellidos,
                direccion: infoComprador.direccion,
                poblacion: infoComprador.poblacion,
                cp: infoComprador.cp,
                email: infoComprador.email,
            },
            productos: productos,
            subtotal: infoProductosFactura[infoProductosFactura.length - 1] * 100,
            paid: 0,
            invoice_nr: 1
        };

        createInvoice(factura, "./public/factura_vinilosFull.pdf");
        res.render("pages/factura")


    },

    registro: (req, res) => {
        registrar(req, res);
    },

    login: (req, res) => {
        loguear(req, res);
    },

    logout: (req, res) => {
        let infoUser = saveSesionStart();
        res.render("pages/home", { info: JSON.stringify(infoUser) });
    }
}


/**
     * Inserta una compra en la base de datos.
     * @constructor
     * @param {string} idsVinilos - Los ids de los vinilos del carrito.
     * @param {string} userInfo - La información del usuario que ha hecho la compra.
     * @return {string} - La información de la nueva compra
     */
async function insertarCompra(idsVinilos, userInfo) {
    var productosComprados = [];
    let arrayIds = idsVinilos.split(",");

    for (let i = 0; i < arrayIds.length; i++) {
        let infoVinilo = await Producto.find({ "id_vinilo": arrayIds[i] })
        productosComprados.push(infoVinilo);
    }

    let compra = {
        id_usuario: userInfo.id_usuario,
        productos: productosComprados,
        created: new Date()
    }

    let nuevaCompra = new Compra(compra)
    nuevaCompra.save(function (err) {
        if (err) throw err;
        console.log("Inserción correcta de la nueva compra");
    });
    return nuevaCompra
}


/**
     * Obtiene toda la información de todos los vinilos de la base de datos "productos"
     * @return {string} - La información de todos los vinilos de la base de datos "productos"
     */
async function obtenerInfoVinilos() {
    var infoVinilo = await Producto.find({});
    return infoVinilo;
}

/**
     * Obtiene toda la información de todos los vinilos de la base de datos "productos_scrapeados"
     * @return {string} - la información de todos los vinilos de la base de datos "productos_scrapeados"
     */
async function obtenerInfoVinilosScrapeadosAll() {
    var infoVinilo2 = await ProductoScrap.find({});
    return infoVinilo2;
}

/**
     * Obtiene toda la información de UN vinilo en la base de datos "productos_scrapeados".
     * @constructor
     * @param {string} id_viniloScrap - El id del vinilo scrapeado del que queremos la información
     * @return {string} - la información de UN vinilo en la base de datos "productos_scrapeados"
     */
async function obtenerInfoVinilosScrapeados(id_viniloScrap) {
    var infoViniloScrap = await ProductoScrap.find({"id_viniloScrap": id_viniloScrap});
    return infoViniloScrap;
}

/**
     * Obtiene la info de todos los vinilos de la base de datos y los desordena
     * @return {string} - La info de todos los vinilos de la base de datos y los desordena
     */
async function obtenerInfoVinilosRandom() {
    var infoRVinilo = await Producto.find({})
    var randomVinil = []
    function getRandom() {
        return Math.floor(Math.random() * infoRVinilo.length)
    }
    // checkeando por no repetidos
    function checkNotRepeat(current, validNumbers) {
        return validNumbers.includes(current)
    }
    while (randomVinil.length < 6) {
        const randomIndex = getRandom()
        if (!checkNotRepeat(infoRVinilo[randomIndex], randomVinil))
            randomVinil.push(infoRVinilo[randomIndex])
    }
    return randomVinil
}

/**
     * Obtiene toda la información de UN vinilo en la base de datos "productos".
     * @constructor
     * @param {string} id_vinilo - El id del vinilo del que queremos la información
     * @return {string} - Toda la información de UN vinilo en la base de datos "productos".
     */
async function obtenerInfoProducto(id_vinilo) {
    var infoProducto = await Producto.find({ "id_vinilo": id_vinilo })
    return infoProducto;
}

/**
     * Obtiene toda la información de todos los vinilos de los generos seleccionados en el buscador de la base de datos "productos".
     * @constructor
     * @param {string} generosCheckados - Los generos filtrados en el buscador
     * @return {string} - Toda la información de todos los vinilos de los generos seleccionados en el buscador de la base de datos "productos".
     */
async function obtenerVinilosGenero(generosCheckados) {
    let aGeneros = generosCheckados.split(",");
    let aDiscos = []
    for (let i = 0; i < aGeneros.length; i++) {
        const vinilosGen = await Producto.find({ genero: aGeneros[i] });
        vinilosGen.push(aGeneros[i])
        aDiscos.push(vinilosGen)
    }
    console.log(aDiscos)
    return aDiscos;
}

/**
     * Obtiene los productos del carrito para generar la factura
     * @constructor
     * @param {string} ids - Los ids de los vinilos del carrito
     * @return {string} - Todos los productos del carrito para generar la factura
     */
async function obtenerInfoProductosFactura(ids) {
    let arrayIds = ids.split(",");
    let arrayProductos = [];
    let precioTotal = 0;
    for (let i = 0; i < arrayIds.length; i++) {
        let infoProductos = await Producto.find({ "id_vinilo": arrayIds[i] });
        arrayProductos.push(infoProductos);
        precioTotal = precioTotal + infoProductos[0].precio
    }
    arrayProductos.push(precioTotal)
    return arrayProductos;
}

/**
     * Obtiene la informacion de un vinilo buscado por titulo
     * @constructor
     * @param {string} titulo - El titulo del vinilo a buscar
     * @return {string} -  la informacion de un vinilo buscado por titulo
     */
async function obtenerViniloTitulo(titulo) {
    const viniloTit = await Producto.find({ "titulo": titulo });
    return viniloTit;
}

/**
     * Obtiene la informacion de los vinilos que hay en el carrito
     * @constructor
     * @param {string} ids - Los ids de los vinilos del carrito
     * @return {string} - Devuelve la información del carrito
     */
async function obtenerProductosCarrito(ids) {
    let arrayIds = ids.split(",");
    if (arrayIds[0] !== "") {
        let arrayProductos = [];
        let precioTotal = 0;
        for (let i = 0; i < arrayIds.length; i++) {
            let infoProductos = await Producto.find({ "id_vinilo": arrayIds[i] });
            arrayProductos.push(infoProductos);
            precioTotal = precioTotal + infoProductos[0].precio
        }
        arrayProductos.push(precioTotal)
        return arrayProductos;
    } else {
        let carritoSinProductos = "No has añadido nada al carrito";
        return carritoSinProductos;
    }

}

/**
     * Valida los datos insertados en el registro, si es correcto se inserta, y sino te da avisos de lo incorrecto
     * @constructor
     * @param {string} req - La informacion que recibe del formulario registro
     * @param {string} res - La respuesta que da a la petición según validacion
     */
async function registrar(req, res) {
    //! ---- Variables de la información del registro -----

    const { nombre, apellidos, email, password, password2, dni, direccion, cp, poblacion, tlf } = req.body;

    //! Expresiones Regulares validaciones:
    var regExpDni = new RegExp(/^[0-9]{8}\-?[a-zA-Z]{1}/);
    var regExpName = new RegExp(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ]+$/u); // Otro para apellidos por el espacio!!
    var regExpEmail = new RegExp(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/);
    var regExpPass = new RegExp(/^(?=\w*\d)(?=\w*[a-zA-Z])\S{6,10}$/);
    var regExpCp = new RegExp(/^\d{5}$/);
    var regExpTlf = new RegExp(/^[0-9]{9}$/); 

    //! Zona de validaciones

    const nombreOk = regExpName.test(nombre);
    const apellidosOk = regExpName.test(apellidos);
    const emailOk = regExpEmail.test(email);
    const passOk = regExpPass.test(password);
    const pass2Ok = regExpPass.test(password2);
    const mismoPassOk = password == password2;
    const dniOk = regExpDni.test(dni) && validation_dni(dni);
    const cpOk = regExpCp.test(cp);
    const tlfOk = regExpTlf.test(tlf);

    var ok = nombreOk && apellidosOk && emailOk && passOk && pass2Ok && mismoPassOk && dniOk && cpOk && tlfOk;

    // //! ---- SI TODAS VALIDACIONES TRUE --------
    if (ok) {
        const existeDni = await busquedaUsuarioDni(dni);

        if ((existeDni) == null) {
            var passEnc = "";
            passEnc = await bcrypt.hash(password, saltRounds);
            let inserta = await insertarUsuario(nombre, apellidos, email, passEnc, dni, direccion, cp, poblacion, tlf, res);
            let estado = "correcto";
            res.render("pages/registerLogin", { validation: estado });
        } else {
            let estado = "existe";
            console.log("existe usuario");
            res.render("pages/registerLogin", { validation: estado });
        }
    } else {
        let estadoError = "incorrecto";
        res.render("pages/registerLogin", { validation: estadoError });
    }
}

// ! ********  LOGUEAR*********
/**
     * Valida los datos insertados en el login, si es correcto se loguea, y sino te da avisos de lo incorrecto
     * @constructor
     * @param {string} req - La informacion que recibe del formulario login
     * @param {string} res - La respuesta que da a la petición según validacion
     */
async function loguear(req, res) {

    //! ---- Variables de la información del registro -----

    const email2 = req.body.email2;
    const password3 = req.body.password3;

    //! Expresiones Regulares validaciones:

    var regExpEmail = new RegExp(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/);
    var regExpPass = new RegExp(/^(?=\w*\d)(?=\w*[a-zA-Z])\S{6,10}$/);

    //! Zona de validaciones

    const emailOk = regExpEmail.test(email2);
    const passOk = regExpPass.test(password3);

    var ok = emailOk && passOk;
 
    // //! ---- SI TODAS VALIDACIONES TRUE --------
    if (ok) {
        // Busca en BD si existe ese mail
        const existeEmail = await busquedaUsuarioEmail(email2);

        if ((existeEmail[0]) == undefined) {
            let registrate = "noExiste";
            res.render("pages/registerLogin", { validation: registrate });
        } else {

            var mismoPass = await bcrypt.compare(password3, existeEmail[0].pass)     // <-- COMPARA LAS 2 PASSWORDS
            if (mismoPass) {
                
                if (existeEmail[0].admin) {
                    let infoUser = saveSesion(existeEmail[0]);
                    let infoDiscos = await obtenerInfoVinilos();
                    let inicioAdmin = "inicio";
                    res.render("pages/admin", { info: JSON.stringify(infoUser), infoDisco: infoDiscos, inicio: inicioAdmin });
                } else {
                    let infoUser = saveSesion(existeEmail[0]);
                    res.render("pages/home", { info: JSON.stringify(infoUser) });
                }
            } else {
                let noPass = "noPass";
                res.render("pages/registerLogin", { validation: noPass });
            }
        }
    } else {
        if (!emailOk) { console.log("Email no válido"); }
        if (!passOk) { console.log("Min 1 número y 1 caracter especial"); }
        let estadoError = "incorrecto";
        res.render("pages/registerLogin", { validation: estadoError });
    }
}

/**
     * Modifica los datos del usuario en la base de datos "usuarios"
     * @constructor
     * @param {string} req - La informacion que recibe del formulario "modificar"
     */
async function modificarUsuario(req) {
    //!! Recoge la info del usuario a modificar; probando con mi user
    let datoEmail = JSON.parse(req.body.data);
    Usuario.find({ email: datoEmail.email }, function (err, user) {
        if (err) throw err;
        if (req.body.nombre != "") { user[0].nombre = req.body.nombre; }
        if (req.body.apellidos != "") { user[0].apellidos = req.body.apellidos; }
        if (req.body.email != "") { user[0].email = req.body.email; }
        // ?? Password no va encriptado, OJO!
        if (req.body.password != "") { user[0].password = req.body.password; }
        if (req.body.dni != "") { user[0].dni = req.body.dni; }
        if (req.body.telefono != "") { user[0].telefono = req.body.telefono; }
        if (req.body.direccion != "") { user[0].direccion = req.body.direccion; }
        if (req.body.cp != "") { user[0].cp = req.body.cp; }
        if (req.body.poblacion != "") { user[0].poblacion = req.body.poblacion; }
        user[0].save(function (err) {
            if (err) throw err;
            console.log("Modificación correcta");
        });
    });
}


/**
     * Inserta disco en la base de datos "productos"
     * @constructor
     * @param {string} req - La informacion que recibe del formulario "insertar disco"
     */
function insertarDisco(req) {
    const disco = {
        titulo: req.body.titulo,
        autor: req.body.autor,
        genero: req.body.genero,
        ano: req.body.ano,
        numDisco: req.body.numDisco,
        precio: req.body.precio,
        imgUrl: req.body.imgUrl
    }

    let nuevoDisco = new Producto(disco);

    nuevoDisco.save(function (err) {
        if (err) throw err;
        console.log(`Inserción correcta del disco ${disco.titulo}`);
    });
}

/**
     * Modifica la información de un disco en la base de datos "productos"
     * @constructor
     * @param {string} req - La informacion que recibe del formulario "modificar disco"
     */
async function modificarDisco(req) {
    //Recoge la info del disco a modificar
    Producto.find({ titulo: req.body.nombreSelect }, function (err, disco) {
        if (err) throw err;
        if (req.body.titulo != "") { disco[0].titulo = req.body.titulo; }
        if (req.body.autor != "") { disco[0].autor = req.body.autor; }
        if (req.body.genero != "") { disco[0].genero = req.body.genero; }
        if (req.body.ano != "") { disco[0].ano = req.body.ano; }
        if (req.body.numDisco != "") { disco[0].numDisco = req.body.numDisco; }
        if (req.body.precio != "") { disco[0].precio = req.body.precio; }
        if (req.body.imgUrl != "") { disco[0].imgUrl = req.body.imgUrl; }
        disco[0].save(function (err) {
            if (err) throw err;
            console.log("Actualización correcta");
        });
    });
}

/**
     * Borrar disco en la base de datos "productos"
     * @constructor
     * @param {string} req - La informacion que recibe del formulario "borrar disco"
     */
async function borrarDisco(req) {
    const info_vinilo = await Producto.find({ titulo: req.body.nombreSelect });
    if (info_vinilo[0] === undefined) {
        console.log(`no existe `);
    } else {
        info_vinilo[0].remove(function (err) {
            if (err) throw err;
            console.log(`Borrado correcto`);
        });
    }
}

/**
     * Da formato al objeto usuario en el localStorage
     * @return {object} - La construcción del usuario vacio
     */
function saveSesionStart() {
    let userStart = {
        id_usuario: "",
        nombre: "",
        apellidos: "",
        email: "",
        dni: "",
        telefono: "",
        direccion: "",
        cp: "",
        poblacion: "",
        admin: false
    }
    return userStart;
}

/**
     * Da formato al objeto usuario en el localStorage cuando inicias sesión
     * @constructor
     * @param {string} datosUser - La información de la base de datos del usuario que acaba de iniciar sesión
     * @return {object} - La construcción del usuario con la información del login
     */
function saveSesion(datosUser) {
    let user = {
        id_usuario: datosUser.id_usuario,
        nombre: datosUser.nombre,
        apellidos: datosUser.apellidos,
        email: datosUser.email,
        dni: datosUser.dni,
        telefono: datosUser.telefono,
        direccion: datosUser.direccion,
        cp: datosUser.cp,
        poblacion: datosUser.poblacion,
        admin: datosUser.admin
    }
    return user;
}

/**
     * Busca un usuario en la base de datos "Usuarios" mediante el dni
     * @constructor
     * @param {string} dni - El dni que se quiere buscar
     * @return {object} - La información del usuario
     */
async function busquedaUsuarioDni(dni) {
    dni = dni.replace("-", "");
    dni = dni.toUpperCase();
    const datos = await Usuario.findOne({ dni: dni });
    return datos;
}

/**
     * Busca un usuario en la base de datos "Usuarios" mediante el email
     * @constructor
     * @param {string} email - El email que se quiere buscar
     * @return {object} - La información del usuario
     */
async function busquedaUsuarioEmail(email) {
    const datos2 = await Usuario.find({ email: email });
    return datos2;
}


/**
     * Inserta un usuario en la base de datos "Usuarios" al registrarse
     * @constructor
     * @param {string} nombre - El nombre que se va a insertar
     * @param {string} apellidos - Los apellidos que se va a insertar
     * @param {string} email - El email que se va a insertar
     * @param {string} pass - La password ya encriptada que se va a insertar
     * @param {string} dni - El dni que se va a insertar
     * @param {string} direccion - La direccion que se va a insertar
     * @param {string} cp - El cp que se va a insertar
     * @param {string} poblacion - La poblacion que se va a insertar
     * @param {string} tlf - El tlf que se va a insertar
     */
async function insertarUsuario(nombre, apellidos, email, pass, dni, direccion, cp, poblacion, tlf) {
    dni = dni.replace("-", "");
    dni = dni.toUpperCase();
    let usuario = {
        nombre: nombre,
        apellidos: apellidos,
        email: email,
        pass: pass,
        dni: dni,
        telefono: tlf,
        direccion: direccion,
        cp: cp,
        poblacion: poblacion,
        compras: [],
        admin: false
    }

    let nuevoUsuario = new Usuario(usuario);

    nuevoUsuario.save(function (err) {
        if (err) throw err;
        console.log(`Inserción correcta del Usuario ${nombre}`);

    });
}

/**
     * Inserta un usuario en la base de datos "Usuarios" al realizar una compra sin estar registrado
     * @constructor
     * @param {string} nombre - El nombre que se va a insertar
     * @param {string} apellidos - Los apellidos que se va a insertar
     * @param {string} email - El email que se va a insertar
     * @param {string} pass - La password vacía porque no es un registro
     * @param {string} dni - El dni que se va a insertar
     * @param {string} direccion - La direccion que se va a insertar
     * @param {string} cp - El cp que se va a insertar
     * @param {string} poblacion - La poblacion que se va a insertar
     * @param {string} tlf - El tlf que se va a insertar
     * @return {object} - La información del usuario
     */
function insertarUsuarioDatosEnvio(nombre, apellidos, email, pass, dni, direccion, cp, poblacion, tlf) {
    dni = dni.replace("-", "");
    dni = dni.toUpperCase();
    let usuario = {
        nombre: nombre,
        apellidos: apellidos,
        email: email,
        pass: pass,
        dni: dni,
        telefono: tlf,
        direccion: direccion,
        cp: cp,
        poblacion: poblacion,
        admin: false
    }

    let nuevoUsuario = new Usuario(usuario);

    nuevoUsuario.save(function (err) {
        if (err) throw err;
        console.log(`Inserción correcta del Usuario ${nombre}`);
    });
    return usuario
}

// ******** VALIDACIONES  ************

/**
     * Comprueba que el formato del DNI sea el correcto según algorítmia policial
     * @constructor
     * @param {string} dni - El dni introducido en el registro
     * @return {boolean} - Si el algoritmo policial esta bien o no
     */
function validationFormat(dni) {
    dni = dni.toUpperCase();
    var letras = "TRWAGMYFPDXBNJZSQVHLCKE";
    var nums = parseInt(dni.substring(0, dni.length - 1));
    var letra = letras[nums % letras.length]; // [nums % letras.length] = posicion de la letra del array de la policia
    return letra == dni[8];
}

/**
     * Comprueba si el DNI introducido tiene guión, y de ser así, lo quita
     * @constructor
     * @param {string} dni - El dni introducido en el registro
     * @return {string} - El DNI en el formato correcto
     */
function quitarGuion(dni) {
    var conGuion = dni.split("-");
    if (conGuion.length == 1) {
        return dni;
    } else {
        return conGuion[0] + conGuion[1];
    }
}

/**
     * Realiza todas las validaciones necesarias para el DNI
     * @constructor
     * @param {string} dni - El dni introducido en el registro
     * @return {boolean} - Si el DNI en el formato correcto
     */
function validation_dni(dni) {
    dni = quitarGuion(dni);
    return validationFormat(dni);
}

module.exports = pages;