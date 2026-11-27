// Aviso por mail cuando alguien envía el formulario.
require("dotenv").config();
const nodemailer = require("nodemailer");

function crearTransporte() {
  const usuario = process.env.MAIL_USUARIO;
  const clave = process.env.MAIL_CLAVE;
  if (!usuario || !clave) return null; // sin configurar: no se envían avisos

  const puerto = Number(process.env.MAIL_PUERTO || 465);
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: puerto,
    secure: puerto === 465,
    auth: { user: usuario, pass: clave },
    connectionTimeout: 10000,
    socketTimeout: 15000
  });
}

function limpiar(texto) {
  return String(texto).replace(/[\r\n]+/g, " ").trim(); // evita inyección en encabezados
}

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function avisarConsulta(datos) {
  const transporte = crearTransporte();
  if (!transporte) throw new Error("Mail sin configurar (revisar el archivo .env)");

  const nombre = limpiar(datos.nombre);
  await transporte.sendMail({
    from: '"Portfolio web" <' + process.env.MAIL_USUARIO + ">",
    to: process.env.MAIL_DESTINO || process.env.MAIL_USUARIO,
    // al responder este mail, la respuesta va directo a quien escribió
    replyTo: { name: nombre, address: limpiar(datos.mail) },
    subject: "Nueva consulta de " + nombre,
    text:
      "Nombre: " + nombre + "\n" +
      "Mail: " + datos.mail + "\n" +
      "Celular: " + datos.celular + "\n\n" +
      datos.consulta,
    html:
      "<h2>Nueva consulta desde tu portfolio</h2>" +
      "<p><strong>Nombre:</strong> " + escaparHtml(nombre) + "<br>" +
      "<strong>Mail:</strong> " + escaparHtml(datos.mail) + "<br>" +
      "<strong>Celular:</strong> " + escaparHtml(datos.celular) + "</p>" +
      "<p>" + escaparHtml(datos.consulta).replace(/\n/g, "<br>") + "</p>"
  });
}

module.exports = { avisarConsulta };
