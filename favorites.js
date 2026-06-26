const grillaFavoritos = document.getElementById("fav-grid");
const pantallaVacia = document.getElementById("empty-favorites");
const contadorFavoritos = document.getElementById("fav-count");
const contadorHero = document.getElementById("fav-count-hero");
const barraFiltros = document.getElementById("barra-filtros-fav");
const filtroAutor = document.getElementById("filtro-autor-fav");

let ultimoEliminado = null;
let ordenActual = "reciente";

const cartel = document.createElement("div");
cartel.className = "cartel-deshacer";
cartel.style.display = "none";
document.body.appendChild(cartel);

function obtenerFavoritos() {
    var datos = localStorage.getItem("coleccion_bookshelf");
    if (datos) {
        return JSON.parse(datos);
    }
    return [];
}

function guardarLista(lista) {
    localStorage.setItem("coleccion_bookshelf", JSON.stringify(lista));
}

function mostrarFavoritos() {
    const favoritos = obtenerFavoritos();
    actualizarContadores();

    if (favoritos.length === 0) {
        pantallaVacia.hidden = false;
        barraFiltros.hidden = true;
        grillaFavoritos.innerHTML = "";
        return;
    }

    pantallaVacia.hidden = true;
    barraFiltros.hidden = false;
    cargarAutores(favoritos);

    var lista = [];
    var autorSeleccionado = filtroAutor.value;

    for (let i = 0; i < favoritos.length; i++) {
        const libro = favoritos[i];
        if (autorSeleccionado === "todos" || libro.autor === autorSeleccionado) {
            lista.push(libro);
        }
    }

    if (ordenActual === "reciente") {
        lista.reverse();
    }

    if (ordenActual === "titulo") {
        lista.sort(function(a, b) {
            return a.titulo.localeCompare(b.titulo);
        });
    }

    if (ordenActual === "año-nuevo") {
        lista.sort(function(a, b) {
            return ordenarAño(obtenerAño(a), 0) - ordenarAño(obtenerAño(b), 0);
        });
    }

    if (ordenActual === "año-viejo") {
        lista.sort(function(a, b) {
            return ordenarAño(obtenerAño(a), 9999) - ordenarAño(obtenerAño(b), 9999);
        });
    }

    if (lista.length === 0) {
        grillaFavoritos.innerHTML = "<p class='mensaje-filtro'>No hay favoritos de ese autor.</p>";
        return;
    }

    dibujarFavoritos(lista);
}

function dibujarFavoritos(lista) {
    grillaFavoritos.innerHTML = "";

    for (var i = 0; i < lista.length; i++) {
        var libro = lista[i];
        var titulo = obtenerTitulo(libro);
        var coverId = obtenerCoverId(libro);
        var año = obtenerAño(libro);
        var portada = "<div class=\"marcador-imagen\">Sin portada<br>" + titulo + "</div>";

        if (coverId !== "") {
            portada = "<img src=\"https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg\" alt=\"Portada\">";
        }

        grillaFavoritos.innerHTML +=
            "<div class=\"tarjeta-libro\" onclick=\"abrirDetalleFavorito('" + libro.id + "')\">" +
            "<button class=\"boton-favorito\" onclick=\"quitarFavorito(event, '" + libro.id + "')\">❤️</button>" +
            "<div class=\"contenedor-portada\">" + portada + "</div>" +
            "<div class=\"info-libro\">" +
            "<h3 class=\"titulo-libro\">" + titulo + "</h3>" +
            "<p class=\"autor-libro\">" + libro.autor + "</p>" +
            "<span class=\"año-libro\">" + año + "</span>" +
            "</div>" +
            "</div>";
    }
}

function quitarFavorito(e, id) {
    e.stopPropagation();

    const favoritos = obtenerFavoritos();
    const listaNueva = [];
    ultimoEliminado = null;

    for (var i = 0; i < favoritos.length; i++) {
        var libro = favoritos[i];

        if (libro.id === id) {
            ultimoEliminado = libro;
        } else {
            listaNueva.push(libro);
        }
    }

    guardarLista(listaNueva);
    mostrarFavoritos();
    mostrarCartel();
}

function mostrarCartel() {
    cartel.innerHTML = "Libro eliminado <button onclick=\"deshacerEliminar()\">Deshacer</button>";
    cartel.style.display = "block";
    cartel.style.opacity = "1";

    setTimeout(function() {
        cartel.style.display = "none";
        ultimoEliminado = null;
    }, 3000);
}

function deshacerEliminar() {
    if (ultimoEliminado === null) {
        return;
    }

    var favoritos = obtenerFavoritos();
    favoritos.push(ultimoEliminado);
    guardarLista(favoritos);

    ultimoEliminado = null;
    cartel.style.display = "none";
    mostrarFavoritos();
}

function eliminarTodosFavoritos() {
    var favoritos = obtenerFavoritos();
    if (favoritos.length === 0) {
        return;
    }
    abrirModalEliminarTodos();
}

function abrirModalEliminarTodos() {
    var modal = document.createElement("div");
    modal.className = "fondo-modal";
    modal.innerHTML =
        "<div class=\"tarjeta-modal modal-confirmacion\">" +
        "<h2>Eliminar favoritos</h2>" +
        "<p>¿Seguro que querés borrar todos los libros guardados?</p>" +
        "<div class=\"botones-confirmacion\">" +
        "<button class=\"boton-cancelar\" onclick=\"cerrarModal()\">Cancelar</button>" +
        "<button class=\"boton-confirmar\" onclick=\"confirmarEliminarTodos()\">Sí, eliminar</button>" +
        "</div>" +
        "</div>";

    modal.addEventListener("click", function(e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    document.body.appendChild(modal);
}

function confirmarEliminarTodos() {
    cerrarModal();
    guardarLista([]);
    ultimoEliminado = null;
    cartel.style.display = "none";
    filtroAutor.value = "todos";
    mostrarFavoritos();
}

function abrirDetalleFavorito(id) {
    var favoritos = obtenerFavoritos();
    var libroSeleccionado = null;

    for (var i = 0; i < favoritos.length; i++) {
        if (favoritos[i].id === id) {
            libroSeleccionado = favoritos[i];
            break;
        }
    }

    if (!libroSeleccionado) {
        return;
    }

    var titulo = obtenerTitulo(libroSeleccionado);
    var año = obtenerAño(libroSeleccionado);
    var coverId = obtenerCoverId(libroSeleccionado);
    var portada = "<div class=\"modal-sin-portada\">Sin portada</div>";
    if (coverId !== "") {
        portada = "<img src=\"https://covers.openlibrary.org/b/id/" + coverId + "-L.jpg\" alt=\"Portada\">";
    }

    var modal = document.createElement("div");
    modal.className = "fondo-modal";
    modal.innerHTML =
        "<div class=\"tarjeta-modal detalle-libro\">" +
        "<button class=\"boton-cerrar-modal\" onclick=\"cerrarModal()\">Cerrar</button>" +
        "<div class=\"modal-portada\">" + portada + "</div>" +
        "<div class=\"modal-info\">" +
        "<h2>" + titulo + "</h2>" +
        "<p><b>Autor:</b> " + libroSeleccionado.autor + "</p>" +
        "<p><b>Primer año:</b> " + año + "</p>" +
        "<p>Este libro esta guardado en tu lista de favoritos.</p>" +
        "<a class=\"link-detalle\" href=\"https://openlibrary.org" + libroSeleccionado.id + "\" target=\"_blank\">Ver en Open Library</a>" +
        "</div>" +
        "</div>";

    modal.addEventListener("click", function(e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    document.body.appendChild(modal);
}

function cerrarModal() {
    var modal = document.querySelector(".fondo-modal");
    if (modal) {
        modal.remove();
    }
}

function ordenarFavoritosPor(orden) {
    ordenActual = orden;
    marcarActivo("fav-btn-" + orden);
    mostrarFavoritos();
}

function marcarActivo(id) {
    var botones = document.querySelectorAll("#barra-filtros-fav .boton-orden");

    for (var i = 0; i < botones.length; i++) {
        botones[i].classList.remove("activo");
    }

    var boton = document.getElementById(id);
    if (boton) {
        boton.classList.add("activo");
    }
}

function cargarAutores(favoritos) {
    var elegido = filtroAutor.value;
    var autores = ["todos"];
    filtroAutor.innerHTML = "<option value=\"todos\">Todos los autores</option>";

    for (var i = 0; i < favoritos.length; i++) {
        var libro = favoritos[i];
        if (libro.autor !== "Autor desconocido" && autores.indexOf(libro.autor) === -1) {
            autores.push(libro.autor);
            filtroAutor.innerHTML += "<option value=\"" + libro.autor + "\">" + libro.autor + "</option>";
        }
    }

    filtroAutor.value = elegido;
    if (filtroAutor.value === "") {
        filtroAutor.value = "todos";
    }
}

function actualizarContadores() {
    var total = obtenerFavoritos().length;
    contadorFavoritos.textContent = total;
    contadorHero.textContent = total;
}

function obtenerCoverId(libro) {
    return libro.coverId || libro.idFoto || "";
}

function obtenerAño(libro) {
    return libro.firstPublishYear || libro.primerAñoPublicacion || libro.año || "S/D";
}

function obtenerTitulo(libro) {
    return libro.titulo || libro.title || "Sin titulo";
}

function ordenarAño(valor, reemplazo) {
    var numero = parseInt(valor, 10);
    if (isNaN(numero)) {
        return reemplazo;
    }
    return numero;
}

window.mostrarFavoritos = mostrarFavoritos;
window.quitarFavorito = quitarFavorito;
window.abrirDetalleFavorito = abrirDetalleFavorito;
window.ordenarFavoritosPor = ordenarFavoritosPor;
window.eliminarTodosFavoritos = eliminarTodosFavoritos;
window.deshacerEliminar = deshacerEliminar;
window.cerrarModal = cerrarModal;
window.confirmarEliminarTodos = confirmarEliminarTodos;

mostrarFavoritos();


