// Rombo de trabajos: se arma solo con los proyectos de la tabla "proyectos".

const colores = [
  ["#f7c6d9", "#f08fd0"], ["#bfe5f6", "#a9bdf0"], ["#e3f4a0", "#aee8da"],
  ["#fbe8a1", "#fbc99c"], ["#d4c2f2", "#a9bdf0"], ["#aee8da", "#bfe5f6"],
  ["#fbc99c", "#f7c6d9"], ["#cfae92", "#fbe8a1"]
];

async function cargarProyectos() {
  const estado = document.getElementById("estadoRombo");
  try {
    const respuesta = await fetch("/proyectos");
    if (!respuesta.ok) throw new Error("Respuesta " + respuesta.status);
    const lista = await respuesta.json();
    armarRombo(lista);
  } catch (error) {
    console.log(error);
    estado.textContent = "No pude cargar los trabajos. Probá recargar la página.";
  }
}

// Solo se permiten enlaces http o https
function urlSegura(texto) {
  try {
    const u = new URL(texto);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function mcd(a, b) { return b === 0 ? a : mcd(b, a % b); }

function armarRombo(lista) {
  const rombo = document.getElementById("rombo");
  const escena = document.getElementById("escena");
  const estado = document.getElementById("estadoRombo");
  const proyectos = lista.filter(function (p) { return urlSegura(p.url); });
  const n = proyectos.length;

  // Aura iridiscente detrás del rombo (se crea una sola vez)
  if (!escena.querySelector(".aura")) {
    const aura = document.createElement("div");
    aura.className = "aura";
    aura.setAttribute("aria-hidden", "true");
    for (let k = 0; k < 5; k++) aura.appendChild(document.createElement("span")).className = "mancha";
    escena.insertBefore(aura, rombo);
  }

  rombo.innerHTML = "";
  if (n === 0) {
    estado.textContent = "Pronto vas a ver acá mis trabajos.";
    return;
  }
  estado.textContent = "";

  // Grilla casi cuadrada. Si la última fila queda incompleta, sus cuadros se ensanchan
  // para llenar todo el ancho: el rombo nunca tiene huecos.
  const columnas = Math.ceil(Math.sqrt(n));
  const filas = Math.ceil(n / columnas);
  const enUltima = n - columnas * (filas - 1);               // cuadros en la última fila
  const total = (columnas * enUltima) / mcd(columnas, enUltima); // mínimo común múltiplo
  const spanNormal = total / columnas;
  const spanUltima = total / enUltima;

  rombo.style.gridTemplateColumns = "repeat(" + total + ", 1fr)";
  rombo.style.gridTemplateRows = "repeat(" + filas + ", 1fr)";
  // Con muchos proyectos el rombo crece un poco para que los cuadros sigan siendo legibles
  escena.style.setProperty("--mult", Math.min(1.25, Math.max(1, columnas / 2.6)).toFixed(2));

  proyectos.forEach(function (p, i) {
    const cuadro = document.createElement("a");
    const par = colores[i % colores.length];
    const ultimaFila = i >= columnas * (filas - 1);

    cuadro.className = "cuadro";
    cuadro.href = p.url;
    cuadro.target = "_blank";
    cuadro.rel = "noopener noreferrer";
    cuadro.setAttribute("role", "listitem");
    cuadro.setAttribute("aria-label", p.nombre + ". Se abre en una pestaña nueva");
    cuadro.style.gridColumn = "span " + (ultimaFila ? spanUltima : spanNormal);
    cuadro.style.setProperty("--c1", par[0]);
    cuadro.style.setProperty("--c2", par[1]);
    cuadro.style.setProperty("--i", i);
    if (p.imagen) {
      cuadro.style.setProperty("--img", 'url("' + encodeURI(p.imagen).replace(/"/g, "%22") + '")');
    }

    const cara = document.createElement("span");
    cara.className = "cara";
    cuadro.appendChild(cara);

    cuadro.addEventListener("mouseenter", function () { mostrarCartel(cuadro, p.nombre); });
    cuadro.addEventListener("focus", function () { mostrarCartel(cuadro, p.nombre); });
    cuadro.addEventListener("mouseleave", ocultarCartel);
    cuadro.addEventListener("blur", ocultarCartel);
    rombo.appendChild(cuadro);
  });
}

// Cartel derecho (fuera de la perspectiva) con el nombre y "Click para verlo"
const cartel = document.createElement("div");
cartel.className = "cartel";
cartel.setAttribute("aria-hidden", "true");
cartel.innerHTML = '<span class="c-nombre"></span><span class="c-cta">Click para verlo</span>';
document.body.appendChild(cartel);

function mostrarCartel(cuadro, nombre) {
  if (!window.matchMedia("(hover: hover)").matches) return;
  const r = cuadro.getBoundingClientRect();
  cartel.querySelector(".c-nombre").textContent = nombre;
  cartel.style.left = (r.left + r.width / 2) + "px";
  cartel.style.top = (r.top + r.height / 2) + "px";
  cartel.classList.add("visible");
}
function ocultarCartel() { cartel.classList.remove("visible"); }
window.addEventListener("scroll", ocultarCartel, { passive: true });

cargarProyectos();
