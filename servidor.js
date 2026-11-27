// importar la conexión creada en el archivo conexion.js
const conexion = require("./conexion");
// aviso por mail (si falla, la consulta igual queda guardada)
const { avisarConsulta } = require("./correo");

// crear un servidor
const express = require("express");       // importa el módulo express
const servidor = express();               // crea un objeto llamado servidor
// activar el servidor en el puerto 
const puerto = process.env.PORT || 3000;
servidor.listen(puerto,
    function () {
        console.log("Servidor activo");       // muestra mensaje en la consola
    }
);

// Definir que entienda formato json y html
servidor.use(express.json());
servidor.use(express.urlencoded({ extended: true }));

// Definir la carpeta pública para el frontend
servidor.use(express.static("public"));

// Escribir las peticiones al servidor: GET y POST

// Proyectos visibles, en el orden definido en la columna "orden"
servidor.get("/proyectos",
    async function (req, respuesta) {
        const sql = "select idproyecto, nombre, categoria, url, imagen from proyectos where visible = 1 order by orden, idproyecto";
        try {
            const resultado = await conexion.query(sql);
            const filas = resultado[0];
            respuesta.json(filas);
        }
        catch (error) {
            console.log(error);
            respuesta.status(500).json({ error: "Error al consultar la base de datos" });
        }
    }
);

// Guardar una consulta del formulario de contacto
servidor.post("/contacto",
    async function (req, respuesta) {
        const cuerpo = req.body || {};

        // trampa anti-robots: si este campo viene completo, se descarta en silencio
        if (cuerpo.web) {
            return respuesta.json({ ok: true });
        }

        const nombre = String(cuerpo.nombre || "").trim();
        const mail = String(cuerpo.mail || "").trim();
        const celular = String(cuerpo.celular || "").replace(/\D/g, ""); // solo dígitos (la columna es bigint)
        const consulta = String(cuerpo.consulta || "").trim();

        // validar en el servidor (el navegador se puede saltear)
        const mailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
        if (!nombre || !mail || !celular || !consulta) {
            return respuesta.status(400).json({ error: "Completá todos los campos." });
        }
        if (!mailValido || mail.length > 120) {
            return respuesta.status(400).json({ error: "El mail no es válido." });
        }
        if (celular.length < 8 || celular.length > 15) {
            return respuesta.status(400).json({ error: "El celular no es válido." });
        }
        if (nombre.length > 120 || consulta.length > 200) {
            return respuesta.status(400).json({ error: "El nombre o la consulta son demasiado largos." });
        }

        // 1) guardar en la base de datos
        const sql = "insert into usuario (nombre, mail, celular, consulta) values (?, ?, ?, ?)";
        try {
            await conexion.query(sql, [nombre, mail, celular, consulta]);
        }
        catch (error) {
            console.log(error);
            if (error.code === "ER_DUP_ENTRY") {
                return respuesta.status(409).json({ error: "Ya recibí una consulta con ese mail. Escribime por WhatsApp si es urgente." });
            }
            return respuesta.status(500).json({ error: "No se pudo guardar la consulta. Probá de nuevo." });
        }

        // 2) responder enseguida y avisar por mail sin hacer esperar a la persona
        respuesta.json({ ok: true });
        avisarConsulta({ nombre: nombre, mail: mail, celular: celular, consulta: consulta })
            .catch(function (error) {
                console.log("No se pudo enviar el aviso por mail (la consulta quedó guardada):", error.message);
            });
    }
);
