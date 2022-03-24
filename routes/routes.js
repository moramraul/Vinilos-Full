const router = require("express").Router();
const pages = require("../controllers/pages.controllers")
 

// !INICIO
// Ruta a página de inicio
router.get("/",pages.home);
router.get("/home", pages.verHome);


// !REGISTRO, LOGIN, LOGOUT
// Ruta para ver la vista registro/login
router.get("/registerLogin", pages.viewRegister);
// Boton de enviar formulario (registro)
router.post("/registro", pages.registro);
// Boton de enviar formulario (login)
router.post("/login", pages.login);
// Botón para cerrar sesión y volver al home
router.get("/logout", pages.logout);


// !TIENDA
// Ruta a tienda
router.get("/tienda",pages.verTienda);
// Boton del buscador por generos
router.post("/verBusqueda", pages.verBusqueda);
// Boton del buscador por titulo
router.post("/verBusquedaTitulo", pages.verBusquedaTitulo);
// Boton de ver producto concreto
router.post("/verProducto", pages.verProducto);


// !HISTORIAL
// Ruta a buscar Historial cuando no estas registrado
router.get("/buscarHist",pages.buscarHist);
// Boton al historial de un usuario no registrado
router.post("/historialNoLogin", pages.historialNoLogin);
//  Boton de Usuario logueado que pincha  (mi perfil -->  historial)
router.post("/historial", pages.historial);


// !PERFIL
// Ruta a "Ver perfil"
router.get("/perfil", pages.verPerfil);
// Ruta a Mi perfil --> Modificar datos
router.get("/modificarPerfil", pages.modificarPerfil);
// Boton de modificar datos de usuario
router.post("/updateUser", pages.updateUser);


// !CARRITO
// Boton de confirmar carrito
router.post("/carritoConfirmado", pages.carritoConfirmado);
// Boton de "Ver Carrito"
router.post("/verCarrito", pages.verCarrito);


// !FINALIZAR COMPRA
// Boton de un submit de después de comprar si no estas registrado
router.post("/submitDatosEnvio", pages.submitDatosEnvio);
// Ruta obtención datos usuario
router.post("/pasarela", pages.datosEnvio2);
// Boton de enviar factura por email
router.post("/enviarMail", pages.enviarMail);
// Boton de Descargar factura cuando compras
router.post("/verFactura", pages.verFactura);


// !ADMIN:
// Boton para volver desde el nav a la vision de admin
router.post("/volverAdmin", pages.volverAdmin);
// Botones para insertar, modificar o eliminar discos
router.post("/addDisco", pages.addDisco);
router.post("/deleteDisco", pages.deleteDisco);
router.post("/updateDisco", pages.updateDisco);
// Boton para añadir vinilos scrapeados a la base de datos 
router.post("/scrapAdmin", pages.scrapAdmin);

module.exports = router;