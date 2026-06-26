const formulario = document.getElementById("search-form");
const inputBusqueda = document.getElementById("search-input");
const grillaLibros = document.getElementById("books-grid");
const pantallaInicio = document.getElementById("empty-state");
const cargando = document.getElementById("loader");
const pantallaError = document.getElementById("error-state");
const sinResultados = document.getElementById("no-results");
const contadorFavoritos = document.getElementById("fav-count");
const barraFiltros = document.getElementById("barra-filtros");
const filtroSiglo = document.getElementById("filtro-siglo");
const contadorResultados = document.getElementById("contador-resultados");
const cantidadResultados = document.getElementById("cantidad-resultados");
const paginacion = document.getElementById("paginacion");
const textoPagina = document.getElementById("texto-pagina");
const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");
const botonesSugerencia = document.querySelectorAll(".chip");

let libros = [];
let ordenActual = "relevancia";
let paginaActual = 1;
const librosPorPagina = 8;

formulario.addEventListener("submit", function(event) {
    event.preventDefault();
    const texto = inputBusqueda.value.trim();
    if (texto === "") {
        return;
    }
    ordenActual = "relevancia";
    paginaActual = 1;
    filtroSiglo.value = "todos";
    marcarActivo("btn-relevancia");
    buscarLibros(texto);
});

for (let i = 0; i < botonesSugerencia.length; i++) {
    botonesSugerencia[i].addEventListener("click", function() {
        const texto = this.getAttribute("data-q");
        inputBusqueda.value = texto;
        ordenActual = "relevancia";
        paginaActual = 1;
        filtroSiglo.value = "todos";
        marcarActivo("btn-relevancia");
        buscarLibros(texto);
    });
}

function buscarLibros(texto) {
    pantallaInicio.hidden = true;
    cargando.hidden = false;
    pantallaError.hidden = true;
    sinResultados.hidden = true;
    barraFiltros.hidden = true;
    contadorResultados.hidden = true;
    paginacion.hidden = true;
    grillaLibros.innerHTML = "";

    fetch("https://openlibrary.org/search.json?q=" + encodeURIComponent(texto) + "&limit=24")
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(datos) {
            cargando.hidden = true;
            libros = datos.docs;
            if (libros.length === 0) {
                sinResultados.hidden = false;
                return;
            }
            barraFiltros.hidden = false;
            contadorResultados.hidden = false;
            aplicarFiltro();
        })
        .catch(function(error) {
            cargando.hidden = true;
            pantallaError.hidden = false;
            console.log(error);
        });
}

function ordenarPor(orden) {
    ordenActual = orden;
    paginaActual = 1;
    marcarActivo("btn-" + orden);
    aplicarFiltro();
}

function aplicarFiltro() {
    let lista = [];
    const filtro = filtroSiglo.value;

    for (let i = 0; i < libros.length; i++) {
        const libro = libros[i];
        const firstPublishYear = libro.first_publish_year;
        if (filtro === "todos") {
            lista.push(libro);
        } else if (filtro === "2000" && firstPublishYear >= 2000) {
            lista.push(libro);
        } else if (filtro === "1900" && firstPublishYear >= 1900 && firstPublishYear <= 1999) {
            lista.push(libro);
        } else if (filtro === "1800" && firstPublishYear >= 1800 && firstPublishYear <= 1899) {
            lista.push(libro);
        } else if (filtro === "antiguo" && firstPublishYear < 1800) {
            lista.push(libro);
        }
    }

    if (ordenActual === "año-nuevo") {
        lista.sort(function(a, b) {
            const firstPublishYearB = b.first_publish_year || 0;
            const firstPublishYearA = a.first_publish_year || 0;
            return firstPublishYearB - firstPublishYearA;
        });
    }
    if (ordenActual === "año-viejo") {
        lista.sort(function(a, b) {
            const firstPublishYearA = a.first_publish_year || 9999;
            const firstPublishYearB = b.first_publish_year || 9999;
            return firstPublishYearA - firstPublishYearB;
        });
    }
    if (ordenActual === "titulo") {
        lista.sort(function(a, b) {
            return (a.title || "").localeCompare(b.title || "");
        });
    }

    if (lista.length === 0) {
        grillaLibros.innerHTML = "";
        cantidadResultados.textContent = 0;
        sinResultados.hidden = false;
        paginacion.hidden = true;
        return;
    }

    sinResultados.hidden = true;
    cantidadResultados.textContent = lista.length;
    mostrarPagina(lista);
}

function mostrarPagina(lista) {
    let totalPaginas = Math.ceil(lista.length / librosPorPagina);
    if (totalPaginas < 1) {
        totalPaginas = 1;
    }
    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }
    const inicio = (paginaActual - 1) * librosPorPagina;
    const fin = inicio + librosPorPagina;
    const librosPagina = lista.slice(inicio, fin);
    mostrarLibros(librosPagina);

    paginacion.hidden = totalPaginas <= 1;
    textoPagina.textContent = "Página " + paginaActual + " de " + totalPaginas;
    btnAnterior.disabled = paginaActual === 1;
    btnSiguiente.disabled = paginaActual === totalPaginas;
}

function cambiarPagina(cambio) {
    paginaActual = paginaActual + cambio;
    aplicarFiltro();
    const filtros = document.getElementById('barra-filtros');
    if (filtros) {
        filtros.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function mostrarLibros(lista) {
    grillaLibros.innerHTML = "";
    const favoritos = obtenerFavoritos();

    for (let i = 0; i < lista.length; i++) {
        const libro = lista[i];
        const titulo = libro.title || "Sin titulo";
        const autor = libro.author_name ? libro.author_name[0] : "Autor desconocido";
        const firstPublishYear = libro.first_publish_year || "S/D";
        const id = libro.key;
        let estaEnFavoritos = false;

        for (let j = 0; j < favoritos.length; j++) {
            if (favoritos[j].id === id) {
                estaEnFavoritos = true;
                break;
            }
        }

        const corazon = estaEnFavoritos ? "❤️" : "🤍";
        const coverId = libro.cover_i || "";
        let portada = "<div class=\"marcador-imagen\">Sin portada<br>" + titulo + "</div>";
        if (coverId) {
            portada = "<img src=\"https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg\" alt=\"Portada\">";
        }

        grillaLibros.innerHTML +=
            "<div class=\"tarjeta-libro\" onclick=\"abrirDetalle('" + id + "')\">" +
            "<button class=\"boton-favorito\" onclick=\"guardarFavorito(event, '" + id + "')\">" + corazon + "</button>" +
            "<div class=\"contenedor-portada\">" + portada + "</div>" +
            "<div class=\"info-libro\">" +
            "<h3 class=\"titulo-libro\">" + titulo + "</h3>" +
            "<p class=\"autor-libro\">" + autor + "</p>" +
            "<span class=\"año-libro\">" + firstPublishYear + "</span>" +
            "</div>" +
            "</div>";
    }
}

function guardarFavorito(e, id) {
    e.stopPropagation();
    let libroSeleccionado = null;
    for (let i = 0; i < libros.length; i++) {
        if (libros[i].key === id) {
            libroSeleccionado = libros[i];
            break;
        }
    }
    if (!libroSeleccionado) {
        return;
    }
    const favoritos = obtenerFavoritos();
    let posicion = -1;
    for (let j = 0; j < favoritos.length; j++) {
        if (favoritos[j].id === id) {
            posicion = j;
            break;
        }
    }
    if (posicion >= 0) {
        favoritos.splice(posicion, 1);
    } else {
        const autor = libroSeleccionado.author_name ? libroSeleccionado.author_name[0] : "Autor desconocido";
        const firstPublishYear = libroSeleccionado.first_publish_year || "S/D";
        const coverId = libroSeleccionado.cover_i || "";
        favoritos.push({
            id: libroSeleccionado.key,
            titulo: libroSeleccionado.title || "Sin titulo",
            autor: autor,
            firstPublishYear: firstPublishYear,
            coverId: coverId
        });
    }
    localStorage.setItem("coleccion_bookshelf", JSON.stringify(favoritos));
    actualizarContador();
    aplicarFiltro();
}

function abrirDetalle(id) {
    let libroSeleccionado = null;
    for (let i = 0; i < libros.length; i++) {
        if (libros[i].key === id) {
            libroSeleccionado = libros[i];
            break;
        }
    }
    if (!libroSeleccionado) {
        return;
    }
    const titulo = libroSeleccionado.title || "Sin titulo";
    const autor = libroSeleccionado.author_name ? libroSeleccionado.author_name.join(", ") : "Autor desconocido";
    const firstPublishYear = libroSeleccionado.first_publish_year || "Sin dato";
    const ediciones = libroSeleccionado.edition_count || "Sin dato";
    const temas = libroSeleccionado.subject ? libroSeleccionado.subject.slice(0, 5).join(", ") : "Sin dato";
    const coverId = libroSeleccionado.cover_i || "";
    let portada = "<div class=\"modal-sin-portada\">Sin portada</div>";
    if (coverId) {
        portada = "<img src=\"https://covers.openlibrary.org/b/id/" + coverId + "-L.jpg\" alt=\"Portada\">";
    }
    const modal = document.createElement("div");
    modal.className = "fondo-modal";
    modal.innerHTML =
        "<div class=\"tarjeta-modal detalle-libro\">" +
        "<button class=\"boton-cerrar-modal\" onclick=\"cerrarModal()\">Cerrar</button>" +
        "<div class=\"modal-portada\">" + portada + "</div>" +
        "<div class=\"modal-info\">" +
        "<h2>" + titulo + "</h2>" +
        "<p><b>Autor:</b> " + autor + "</p>" +
        "<p><b>Primer año:</b> " + firstPublishYear + "</p>" +
        "<p><b>Ediciones:</b> " + ediciones + "</p>" +
        "<p><b>Temas:</b> " + temas + "</p>" +
        "<a class=\"link-detalle\" href=\"https://openlibrary.org" + libroSeleccionado.key + "\" target=\"_blank\">Ver en Open Library</a>" +
        "</div>" +
        "</div>";
    modal.addEventListener("click", function(event) {
        if (event.target === modal) {
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
    inputBusqueda.value = "";
    libros = [];
    ordenActual = "relevancia";
    paginaActual = 1;
    filtroSiglo.value = "todos";
    grillaLibros.innerHTML = "";
    cargando.hidden = true;
    pantallaError.hidden = true;
    sinResultados.hidden = true;
    barraFiltros.hidden = true;
    contadorResultados.hidden = true;
    paginacion.hidden = true;
    cantidadResultados.textContent = 0;
    pantallaInicio.hidden = false;
    marcarActivo("btn-relevancia");
    inputBusqueda.focus();
}

function marcarActivo(id) {
    const botones = document.querySelectorAll(".boton-orden");
    for (let i = 0; i < botones.length; i++) {
        botones[i].classList.remove("activo");
    }
    const boton = document.getElementById(id);
    if (boton) {
        boton.classList.add("activo");
    }
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
    contadorFavoritos.textContent = favoritos.length;
}

window.ordenarPor = ordenarPor;
window.aplicarFiltro = aplicarFiltro;
window.guardarFavorito = guardarFavorito;
window.abrirDetalle = abrirDetalle;
window.cerrarModal = cerrarModal;
window.limpiarBusqueda = limpiarBusqueda;
window.cambiarPagina = cambiarPagina;

actualizarContador();
