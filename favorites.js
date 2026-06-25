const $grillaFavoritos = document.getElementById("fav-grid");
const $pantallaVacia = document.getElementById("empty-favorites");
const $contadorFavoritos = document.getElementById("fav-count");
const $contadorHero = document.getElementById("fav-count-hero");
const $barraFiltros = document.getElementById("barra-filtros-fav");
const $filtroAutor = document.getElementById("filtro-autor-fav");

let ultimoEliminado = null;
let ordenActual = "reciente";

const $cartel = document.createElement("div");
$cartel.className = "cartel-deshacer";
$cartel.style.display = "none";
document.body.appendChild($cartel);

function obtenerFavoritos() {
    const datos = localStorage.getItem("coleccion_bookshelf");

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

    if (favoritos.length == 0) {
        $pantallaVacia.hidden = false;
        $barraFiltros.hidden = true;
        $grillaFavoritos.innerHTML = "";
        return;
    }

    $pantallaVacia.hidden = true;
    $barraFiltros.hidden = false;
    cargarAutores(favoritos);

    let lista = [];
    const autor = $filtroAutor.value;

    favoritos.forEach((libro) => {
        if (autor == "todos" || libro.autor == autor) {
            lista.push(libro);
        }
    });

    if (ordenActual == "reciente") {
        lista.reverse();
    }

    if (ordenActual == "titulo") {
        lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }

    if (ordenActual == "anio-nuevo") {
        lista.sort((a, b) => ordenarAnio(b.anio, 0) - ordenarAnio(a.anio, 0));
    }

    if (ordenActual == "anio-viejo") {
        lista.sort((a, b) => ordenarAnio(a.anio, 9999) - ordenarAnio(b.anio, 9999));
    }

    if (lista.length == 0) {
        $grillaFavoritos.innerHTML = `<p class="mensaje-filtro">No hay favoritos de ese autor.</p>`;
        return;
    }

    dibujarFavoritos(lista);
}

function dibujarFavoritos(lista) {
    $grillaFavoritos.innerHTML = "";

    lista.forEach((libro) => {
        let portada = `<div class="marcador-imagen">Sin portada<br>${libro.titulo}</div>`;

        if (libro.fotoId != "") {
            portada = `<img src="https://covers.openlibrary.org/b/id/${libro.fotoId}-M.jpg" alt="Portada">`;
        }

        $grillaFavoritos.innerHTML += `
            <div class="tarjeta-libro" onclick="abrirDetalleFavorito('${libro.id}')">
                <button class="boton-favorito" onclick="quitarFavorito(event, '${libro.id}')">❤️</button>
                <div class="contenedor-portada">${portada}</div>
                <div class="info-libro">
                    <h3 class="titulo-libro">${libro.titulo}</h3>
                    <p class="autor-libro">${libro.autor}</p>
                    <span class="anio-libro">${libro.anio}</span>
                </div>
            </div>
        `;
    });
}

function quitarFavorito(e, id) {
    e.stopPropagation();

    const favoritos = obtenerFavoritos();
    let nuevaLista = [];
    ultimoEliminado = null;

    favoritos.forEach((libro) => {
        if (libro.id == id) {
            ultimoEliminado = libro;
        } else {
            nuevaLista.push(libro);
        }
    });

    guardarLista(nuevaLista);
    mostrarFavoritos();
    mostrarCartel();
}

function mostrarCartel() {
    $cartel.innerHTML = `Libro eliminado <button onclick="deshacerEliminar()">Deshacer</button>`;
    $cartel.style.display = "block";
    $cartel.style.opacity = "1";

    setTimeout(() => {
        $cartel.style.display = "none";
        ultimoEliminado = null;
    }, 3000);
}

function deshacerEliminar() {
    if (ultimoEliminado == null) {
        return;
    }

    const favoritos = obtenerFavoritos();
    favoritos.push(ultimoEliminado);
    guardarLista(favoritos);

    ultimoEliminado = null;
    $cartel.style.display = "none";
    mostrarFavoritos();
}

function eliminarTodosFavoritos() {
    const favoritos = obtenerFavoritos();

    if (favoritos.length == 0) {
        return;
    }

    abrirModalEliminarTodos();
}

function abrirModalEliminarTodos() {
    const modal = document.createElement("div");
    modal.className = "fondo-modal";

    modal.innerHTML = `
        <div class="tarjeta-modal modal-confirmacion">
            <h2>Eliminar favoritos</h2>
            <p>¿Seguro que querés borrar todos los libros guardados?</p>
            <div class="botones-confirmacion">
                <button class="boton-cancelar" onclick="cerrarModal()">Cancelar</button>
                <button class="boton-confirmar" onclick="confirmarEliminarTodos()">Sí, eliminar</button>
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

function confirmarEliminarTodos() {
    cerrarModal();

    guardarLista([]);
    ultimoEliminado = null;
    $cartel.style.display = "none";
    $filtroAutor.value = "todos";
    mostrarFavoritos();
}

function abrirDetalleFavorito(id) {
    const favoritos = obtenerFavoritos();
    const libro = favoritos.find((favorito) => favorito.id == id);

    let portada = `<div class="modal-sin-portada">Sin portada</div>`;

    if (libro.fotoId != "") {
        portada = `<img src="https://covers.openlibrary.org/b/id/${libro.fotoId}-L.jpg" alt="Portada">`;
    }

    const modal = document.createElement("div");
    modal.className = "fondo-modal";

    modal.innerHTML = `
        <div class="tarjeta-modal detalle-libro">
            <button class="boton-cerrar-modal" onclick="cerrarModal()">Cerrar</button>
            <div class="modal-portada">${portada}</div>
            <div class="modal-info">
                <h2>${libro.titulo}</h2>
                <p><b>Autor:</b> ${libro.autor}</p>
                <p><b>Año:</b> ${libro.anio}</p>
                <p>Este libro esta guardado en tu lista de favoritos.</p>
                <a class="link-detalle" href="https://openlibrary.org${libro.id}" target="_blank">Ver en Open Library</a>
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

function ordenarFavoritosPor(orden) {
    ordenActual = orden;
    marcarActivo("fav-btn-" + orden);
    mostrarFavoritos();
}

function marcarActivo(id) {
    const botones = document.querySelectorAll("#barra-filtros-fav .boton-orden");

    botones.forEach((boton) => {
        boton.classList.remove("activo");
    });

    document.getElementById(id).classList.add("activo");
}

function cargarAutores(favoritos) {
    const elegido = $filtroAutor.value;
    let autores = [];

    $filtroAutor.innerHTML = `<option value="todos">Todos los autores</option>`;

    favoritos.forEach((libro) => {
        if (!autores.includes(libro.autor) && libro.autor != "Autor desconocido") {
            autores.push(libro.autor);
        }
    });

    autores.forEach((autor) => {
        $filtroAutor.innerHTML += `<option value="${autor}">${autor}</option>`;
    });

    $filtroAutor.value = elegido;

    if ($filtroAutor.value == "") {
        $filtroAutor.value = "todos";
    }
}

function actualizarContadores() {
    const total = obtenerFavoritos().length;
    $contadorFavoritos.textContent = total;
    $contadorHero.textContent = total;
}

function ordenarAnio(valor, reemplazo) {
    const numero = parseInt(valor);

    if (isNaN(numero)) {
        return reemplazo;
    }

    return numero;
}

window.mostrarFavoritos = mostrarFavoritos;
window.quitarFavorito = quitarFavorito;
window.deshacerEliminar = deshacerEliminar;
window.eliminarTodosFavoritos = eliminarTodosFavoritos;
window.confirmarEliminarTodos = confirmarEliminarTodos;
window.abrirDetalleFavorito = abrirDetalleFavorito;
window.cerrarModal = cerrarModal;
window.ordenarFavoritosPor = ordenarFavoritosPor;

mostrarFavoritos();

