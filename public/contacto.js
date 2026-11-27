// Formulario de contacto: valida y envía los datos al servidor (tabla "usuario").

const formulario = document.getElementById("formulario");
const aviso = document.getElementById("aviso");
const botonEnviar = document.getElementById("botonEnviar");
const consulta = document.getElementById("consulta");
const contador = document.getElementById("contador");

function mostrarAviso(texto, tipo) {
  aviso.textContent = texto;
  aviso.className = "aviso " + (tipo || "");
}

function actualizarContador() {
  contador.textContent = consulta.value.length + " / 200";
}
consulta.addEventListener("input", actualizarContador);

// Indica que el reset lo hizo el programa tras un envío exitoso (para no borrar el aviso de éxito)
let reinicioPorEnvio = false;

formulario.addEventListener("reset", function () {
  const conservarAviso = reinicioPorEnvio;
  reinicioPorEnvio = false;
  // el reset limpia los campos después del evento, por eso se espera un instante
  setTimeout(function () {
    actualizarContador();
    if (!conservarAviso) mostrarAviso("", "");
    formulario.querySelectorAll(".invalido").forEach(function (c) { c.classList.remove("invalido"); });
  }, 0);
});

// Quita la marca de error apenas la persona corrige el campo
formulario.addEventListener("input", function (e) { e.target.classList.remove("invalido"); });

function validar() {
  const campos = ["nombre", "mail", "celular", "consulta"];
  let primero = null;
  campos.forEach(function (id) {
    const c = document.getElementById(id);
    let valido = c.value.trim() !== "";
    if (id === "mail") valido = valido && c.checkValidity();
    if (id === "celular") {
      const digitos = c.value.replace(/\D/g, "");
      valido = digitos.length >= 8 && digitos.length <= 15;
    }
    c.classList.toggle("invalido", !valido);
    if (!valido && !primero) primero = c;
  });
  if (primero) {
    primero.focus();
    const msj = {
      nombre: "Escribí tu nombre.",
      mail: "Revisá el mail: tiene que ser una dirección válida.",
      celular: "Revisá el celular: usá solo números (entre 8 y 15 dígitos).",
      consulta: "Contame brevemente tu consulta."
    };
    mostrarAviso(msj[primero.id], "error");
    return false;
  }
  return true;
}

formulario.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!validar()) return;

  const datos = {
    nombre: document.getElementById("nombre").value.trim(),
    mail: document.getElementById("mail").value.trim(),
    celular: document.getElementById("celular").value.trim(),
    consulta: consulta.value.trim(),
    web: formulario.elements["web"].value // trampa anti-robots: debe ir vacío
  };

  botonEnviar.disabled = true;
  mostrarAviso("Enviando…", "");
  try {
    const respuesta = await fetch("/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    const resultado = await respuesta.json().catch(function () { return {}; });
    if (!respuesta.ok) throw new Error(resultado.error || "No se pudo enviar.");
    reinicioPorEnvio = true;
    formulario.reset();
    mostrarAviso("✓ ¡Mensaje enviado con éxito! Recibí tu consulta y te respondo por mail.", "ok");
  } catch (error) {
    mostrarAviso(error.message || "No se pudo enviar. Probá de nuevo en un rato.", "error");
  } finally {
    botonEnviar.disabled = false;
  }
});
