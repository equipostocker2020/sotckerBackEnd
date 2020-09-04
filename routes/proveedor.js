//requires
var express = require("express");
var app = express();
// //json web token
var jwt = require("jsonwebtoken");
//requiere modelo
var Proveedor = require("../models/proveedor");
//middleware
var mdAutenticacion = require("../middlewares/autenticacion");
// falta encriptar contraseña.
var bcrypt = require("bcryptjs");

// obtener proveedor...
app.get("/", (req, res) => {
    // enumerando
    var desde = req.query.desde || 0;
    // busca y mapea los atributos marcados
    Proveedor.find({}, "nombre direccion cuit email telefono situacion_afip img estado")
        .skip(desde)
        .limit(15)
        // ejecuta, puede tener un error manejado.
        .exec((err, proveedor) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando proveedor",
                    errors: err,
                });
            }
            // metodo count donde va contando proveedor simplemente muestra un int que se incrementa con cada nuevo registro
            Proveedor.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    proveedor: proveedor,
                    total: conteo,
                });
            });
        });
});
// crear proveedor
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    // seteo el body que viaja en el request. Todos los campos required del modelo deben estar aca si no falla
    // esto se setea en postam. Al hacer la peticion post en el body tipo x-www-form-urlencoded.
    var body = req.body;
    var proveedor = new Proveedor({
        nombre: body.nombre,
        direccion: body.direccion,
        cuit: body.cuit,
        email: body.email,
        telefono: body.telefono,
        situacion_afip: body.situacion_afip,
        logo: body.logo,
        costo_unidad: body.costo_unidad,
        costo_mayorista: body.mayorista,
        estado: body.estado,
    });
    // si se mando el request correcto se guarda. Este metodo puede traer un error manejado.
    proveedor.save((err, proveedorGuardado) => {
        // si hay un error....
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear proveedor",
                errors: err,
            });
        }
        // si pasa ok ...
        res.status(201).json({
            ok: true,
            proveedor: proveedorGuardado,
            proveedorToken: req.proveedores,
        });
    });
});

//actualiza un proveedor especifico
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Proveedor.findById(id, (err, proveedor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar proveedor",
                errors: err,
            });
        }

        if (!proveedor) {
            return res.status(400).json({
                ok: false,
                mensaje: "El proveedor con el ID" + id + " no existe",
                errors: { message: " No existe un proveedor con ese ID" },
            });
        }

        proveedor.nombre = body.nombre;
        proveedor.direccion = body.direccion;
        proveedor.cuit = body.cuit;
        proveedor.email = body.email;
        proveedor.telefono = body.telefono;
        proveedor.situacion_afip = body.situacion_afip;
        proveedor.logo = body.img;
        proveedor.estado = body.estado;

        proveedor.save((err, proveedorGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar proveedor",
                    errors: err,
                });
            }
            proveedorGuardado.password = "=)";
            res.status(200).json({
                ok: true,
                proveedor: proveedorGuardado,
            });
        });
    });
});

// borra un proveedor especifico
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Proveedor.findByIdAndRemove(id, (err, proveedorBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar proveedor",
                errors: err,
            });
        }

        if (!proveedorBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un proveedor con este ID",
                errors: { message: "No existe un proveedor con este ID" },
            });
        }

        res.status(200).json({
            ok: true,
            proveedor: proveedorBorrado,
        });
    });
});

module.exports = app;