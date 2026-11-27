// Código compartido por todas las páginas: tema claro/oscuro, destellos de fondo,
// aparición al hacer scroll y resaltado del menú.
(function () {
  const raiz = document.documentElement;
  raiz.classList.add("js");

  // Aplicar el tema guardado lo antes posible (evita el parpadeo)
  let tema = "claro";
  try { tema = localStorage.getItem("tema") || "claro"; } catch (e) { /* sin almacenamiento */ }
  raiz.dataset.tema = tema;

  document.addEventListener("DOMContentLoaded", function () {
    iniciarTema();
    crearBrillos();
    iniciarRevelado();
    marcarMenu();
  });

  // ---------- Tema ----------
  function iniciarTema() {
    const boton = document.getElementById("botonTema");
    if (!boton) return;
    actualizarBoton(boton);
    boton.addEventListener("click", function () {
      const nuevo = raiz.dataset.tema === "oscuro" ? "claro" : "oscuro";
      raiz.dataset.tema = nuevo;
      try { localStorage.setItem("tema", nuevo); } catch (e) { /* ignorar */ }
      actualizarBoton(boton);
    });
  }

  function actualizarBoton(boton) {
    const oscuro = raiz.dataset.tema === "oscuro";
    boton.setAttribute("aria-pressed", String(oscuro));
    boton.setAttribute("aria-label", oscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
  }

  // ---------- Destellos de colores pastel ----------
  function crearBrillos() {
    const contenedor = document.getElementById("brillos");
    if (!contenedor) return;
    const colores = ["#f7c6d9", "#d4c2f2", "#a9bdf0", "#bfe5f6", "#f08fd0",
                     "#e3f4a0", "#cfae92", "#fbe8a1", "#aee8da", "#fbc99c", "#ffffff"];
    const cantidad = window.innerWidth < 600 ? 14 : 26;
    const al = (min, max) => min + Math.random() * (max - min);

    for (let i = 0; i < cantidad; i++) {
      const brillo = document.createElement("span");
      const tam = al(5, 14);
      brillo.className = "brillo";
      brillo.style.width = brillo.style.height = tam + "px";
      brillo.style.left = al(0, 100) + "%";
      brillo.style.top = al(0, 100) + "%";
      brillo.style.setProperty("--c", colores[i % colores.length]);
      brillo.style.setProperty("--dx", al(-30, 30) + "vw");
      brillo.style.setProperty("--dy", al(-30, 30) + "vh");
      brillo.style.setProperty("--t", al(25, 50) + "s");
      brillo.style.setProperty("--p", al(3, 7) + "s");
      brillo.style.setProperty("--d", "-" + al(0, 30) + "s");
      contenedor.appendChild(brillo);
    }
  }

  // ---------- Aparición al hacer scroll ----------
  function iniciarRevelado() {
    const items = document.querySelectorAll(".revelar");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { observador.observe(el); });
  }

  // ---------- Resaltar la sección visible en el menú ----------
  function marcarMenu() {
    const enlaces = document.querySelectorAll('.nav a[href^="#"]');
    if (!enlaces.length || !("IntersectionObserver" in window)) return;

    function marcar(id) {
      enlaces.forEach(function (a) {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }
    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) marcar(e.target.id); });
    }, { rootMargin: "-40% 0px -50% 0px" });
    document.querySelectorAll("main section[id], footer[id]").forEach(function (s) { observador.observe(s); });

    window.addEventListener("scroll", function () {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) marcar("contacto");
    }, { passive: true });
  }
})();
