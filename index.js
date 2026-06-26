const $formulario = document.getElementById("search-form");
const $inputBusqueda = document.getElementById("search-input");
const $grillaLibros = document.getElementById("books-grid");
const $pantallaInicio = document.getElementById("empty-state");
const $cargando = document.getElementById("loader");
const $pantallaError = document.getElementById("error-state");
const $sinResultados = document.getElementById("no-results");
const $contadorFavoritos = document.getElementById("fav-count");
const $barraFiltros = document.getElementById("barra-filtros");
const $filtroSiglo = document.getElementById("filtro-siglo");
const $contadorResultados = document.getElementById("contador-resultados");
const $cantidadResultados = document.getElementById("cantidad-resultados");
const $paginacion = document.getElementById("paginacion");
const $textoPagina = document.getElementById("texto-pagina");
const $btnAnterior = document.getElementById("btn-anterior");
const $btnSiguiente = document.getElementById("btn-siguiente");

let libros = [];
let ordenActual = "relevancia";
let paginaActual = 1;
const librosPorPagina = 8;

$formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = $inputBusqueda.value.trim();

    if (texto == "") {
        return;
    }

    ordenActual = "relevancia";
    paginaActual = 1;
    $filtroSiglo.value = "todos";
    marcarActivo("btn-relevancia");
    buscarLibros(texto);
});

const $botonesSugerencia = document.querySelectorAll(".chip");

$botonesSugerencia.forEach((boton) => {
    boton.addEventListener("click", () => {
        const texto = boton.getAttribute("data-q");
        $inputBusqueda.value = texto;
        ordenActual = "relevancia";
        paginaActual = 1;
        $filtroSiglo.value = "todos";
        marcarActivo("btn-relevancia");
        buscarLibros(texto);
    });
});

async function buscarLibros(texto) {
    $cargando.hidden = false;
    $pantallaInicio.hidden = true;
    $pantallaError.hidden = true;
    $sinResultados.hidden = true;
    $barraFiltros.hidden = true;
    $contadorResultados.hidden = true;
    $paginacion.hidden = true;
    $grillaLibros.innerHTML = "";

    try {
        const respuesta = await fetch("https://openlibrary.org/search.json?q=" + encodeURIComponent(texto) + "&limit=24");
        const datos = await respuesta.json();

        $cargando.hidden = true;
        libros = datos.docs;

        if (libros.length == 0) {
            $sinResultados.hidden = false;
            return;
        }

        $barraFiltros.hidden = false;
        $contadorResultados.hidden = false;
        aplicarFiltro();
    } catch (error) {
        $cargando.hidden = true;
        $pantallaError.hidden = false;
        console.log(error);
    }
}

function ordenarPor(orden) {
    ordenActual = orden;
    paginaActual = 1;
    marcarActivo("btn-" + orden);
    aplicarFiltro();
}

function aplicarFiltro() {
    let lista = [];
    const filtro = $filtroSiglo.value;

    libros.forEach((libro) => {
        const año = libro.first_publish_year;

        if (filtro == "todos") {
            lista.push(libro);
        } else if (filtro == "2000" && año >= 2000) {
            lista.push(libro);
        } else if (filtro == "1900" && año >= 1900 && año <= 1999) {
            lista.push(libro);
        } else if (filtro == "1800" && año >= 1800 && año <= 1899) {
            lista.push(libro);
        } else if (filtro == "antiguo" && año < 1800) {
            lista.push(libro);
        }
    });

    if (ordenActual == "año-nuevo") {
        lista.sort((a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0));
    }

    if (ordenActual == "año-viejo") {
        lista.sort((a, b) => (a.first_publish_year || 9999) - (b.first_publish_year || 9999));
    }

    if (ordenActual == "titulo") {
        lista.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    if (lista.length == 0) {
        $grillaLibros.innerHTML = "";
        $cantidadResultados.textContent = 0;
        $sinResultados.hidden = false;
        $paginacion.hidden = true;
    } else {
        $sinResultados.hidden = true;
        $cantidadResultados.textContent = lista.length;
        mostrarPagina(lista);
    }
}

function mostrarPagina(lista) {
    const totalPaginas = Math.ceil(lista.length / librosPorPagina);

    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }

    const inicio = (paginaActual - 1) * librosPorPagina;
    const fin = inicio + librosPorPagina;
    const librosPagina = lista.slice(inicio, fin);

    mostrarLibros(librosPagina);

    if (totalPaginas > 1) {
        $paginacion.hidden = false;
    } else {
        $paginacion.hidden = true;
    }

    $textoPagina.textContent = "Página " + paginaActual + " de " + totalPaginas;
    $btnAnterior.disabled = paginaActual == 1;
    $btnSiguiente.disabled = paginaActual == totalPaginas;
}

function cambiarPagina(cambio) {
    paginaActual = paginaActual + cambio;
    aplicarFiltro();
}

function mostrarLibros(lista) {
    $grillaLibros.innerHTML = "";
    const favoritos = obtenerFavoritos();

    lista.forEach((libro) => {
        const titulo = libro.title || "Sin titulo";
        const autor = libro.author_name ? libro.author_name[0] : "Autor desconocido";
        const año = libro.first_publish_year || "S/D";
        const id = libro.key;
        const estaEnFavoritos = favoritos.some((favorito) => favorito.id == id);
        const corazon = estaEnFavoritos ? "❤️" : "🤍";

        let portada = `<div class="marcador-imagen">Sin portada<br>${titulo}</div>`;

        if (libro.cover_i) {
            portada = `<img src="https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg" alt="Portada">`;
        }

        $grillaLibros.innerHTML += `
            <div class="tarjeta-libro" onclick="abrirDetalle('${id}')">
                <button class="boton-favorito" onclick="guardarFavorito(event, '${id}')">${corazon}</button>
                <div class="contenedor-portada">${portada}</div>
                <div class="info-libro">
                    <h3 class="titulo-libro">${titulo}</h3>
                    <p class="autor-libro">${autor}</p>
                    <span class="año-libro">${año}</span>
                </div>
            </div>
        `;
    });
}

function guardarFavorito(e, id) {
    e.stopPropagation();

    const libro = libros.find((libroActual) => libroActual.key == id);
    let favoritos = obtenerFavoritos();
    const posicion = favoritos.findIndex((favorito) => favorito.id == id);

    if (posicion >= 0) {
        favoritos.splice(posicion, 1);
    } else {
        favoritos.push({
            id: libro.key,
            titulo: libro.title || "Sin titulo",
            autor: libro.author_name ? libro.author_name[0] : "Autor desconocido",
            año: libro.first_publish_year || "S/D",
            fotoId: libro.cover_i || ""
        });
    }

    localStorage.setItem("coleccion_bookshelf", JSON.stringify(favoritos));
    actualizarContador();
    aplicarFiltro();
}

function abrirDetalle(id) {
    const libro = libros.find((libroActual) => libroActual.key == id);

    const titulo = libro.title || "Sin titulo";
    const autor = libro.author_name ? libro.author_name.join(", ") : "Autor desconocido";
    const año = libro.first_publish_year || "Sin dato";
    const ediciones = libro.edition_count || "Sin dato";
    const temas = libro.subject ? libro.subject.slice(0, 5).join(", ") : "Sin dato";

    let portada = `<div class="modal-sin-portada">Sin portada</div>`;

    if (libro.cover_i) {
        portada = `<img src="https://covers.openlibrary.org/b/id/${libro.cover_i}-L.jpg" alt="Portada">`;
    }

    const modal = document.createElement("div");
    modal.className = "fondo-modal";

    modal.innerHTML = `
        <div class="tarjeta-modal detalle-libro">
            <button class="boton-cerrar-modal" onclick="cerrarModal()">Cerrar</button>
            <div class="modal-portada">${portada}</div>
            <div class="modal-info">
                <h2>${titulo}</h2>
                <p><b>Autor:</b> ${autor}</p>
                <p><b>Primer año:</b> ${año}</p>
                <p><b>Ediciones:</b> ${ediciones}</p>
                <p><b>Temas:</b> ${temas}</p>
                <a class="link-detalle" href="https://openlibrary.org${libro.key}" target="_blank">Ver en Open Library</a>
            </div>
        </div>
    `;

    modal.addEventListener("click", (e) => {
        if (e.target == modal) {
            cerrarModal();
        }
    });

    document.body.appendChild(modal);
}

function cerrarModal() {
    const modal = document.querySelector(".fondo-modal");
    if (modal) {
        modal.remove();
    }
}

function limpiarBusqueda() {
    $inputBusqueda.value = "";
    libros = [];
    ordenActual = "relevancia";
    paginaActual = 1;
    $filtroSiglo.value = "todos";

    $grillaLibros.innerHTML = "";
    $cargando.hidden = true;
    $pantallaError.hidden = true;
    $sinResultados.hidden = true;
    $barraFiltros.hidden = true;
    $contadorResultados.hidden = true;
    $paginacion.hidden = true;
    $cantidadResultados.textContent = 0;
    $pantallaInicio.hidden = false;

    marcarActivo("btn-relevancia");
    $inputBusqueda.focus();
}

function marcarActivo(id) {
    const botones = document.querySelectorAll(".boton-orden");

    botones.forEach((boton) => {
        boton.classList.remove("activo");
    });

    document.getElementById(id).classList.add("activo");
}

function obtenerFavoritos() {
    const datos = localStorage.getItem("coleccion_bookshelf");

    if (datos) {
        return JSON.parse(datos);
    }

    return [];
}

function actualizarContador() {
    const favoritos = obtenerFavoritos();
    $contadorFavoritos.textContent = favoritos.length;
}

window.ordenarPor = ordenarPor;
window.aplicarFiltro = aplicarFiltro;
window.guardarFavorito = guardarFavorito;
window.abrirDetalle = abrirDetalle;
window.cerrarModal = cerrarModal;
window.limpiarBusqueda = limpiarBusqueda;
window.cambiarPagina = cambiarPagina;

actualizarContador();


