import"./styles-D1a0Tqep.js";var e=document.getElementById(`fav-grid`),t=document.getElementById(`empty-favorites`),n=document.getElementById(`fav-count`),r=document.getElementById(`fav-count-hero`),i=document.getElementById(`barra-filtros-fav`),a=document.getElementById(`filtro-autor-fav`),o=null,s=`reciente`,c=document.createElement(`div`);c.className=`cartel-deshacer`,c.style.display=`none`,document.body.appendChild(c);function l(){let e=localStorage.getItem(`coleccion_bookshelf`);return e?JSON.parse(e):[]}function u(e){localStorage.setItem(`coleccion_bookshelf`,JSON.stringify(e))}function d(){let n=l();if(w(),n.length==0){t.hidden=!1,i.hidden=!0,e.innerHTML=``;return}t.hidden=!0,i.hidden=!1,C(n);let r=[],o=a.value;if(n.forEach(e=>{(o==`todos`||e.autor==o)&&r.push(e)}),s==`reciente`&&r.reverse(),s==`titulo`&&r.sort((e,t)=>e.titulo.localeCompare(t.titulo)),s==`anio-nuevo`&&r.sort((e,t)=>T(t.anio,0)-T(e.anio,0)),s==`anio-viejo`&&r.sort((e,t)=>T(e.anio,9999)-T(t.anio,9999)),r.length==0){e.innerHTML=`<p class="mensaje-filtro">No hay favoritos de ese autor.</p>`;return}f(r)}function f(t){e.innerHTML=``,t.forEach(t=>{let n=`<div class="marcador-imagen">Sin portada<br>${t.titulo}</div>`;t.fotoId!=``&&(n=`<img src="https://covers.openlibrary.org/b/id/${t.fotoId}-M.jpg" alt="Portada">`),e.innerHTML+=`
            <div class="tarjeta-libro" onclick="abrirDetalleFavorito('${t.id}')">
                <button class="boton-favorito" onclick="quitarFavorito(event, '${t.id}')">❤️</button>
                <div class="contenedor-portada">${n}</div>
                <div class="info-libro">
                    <h3 class="titulo-libro">${t.titulo}</h3>
                    <p class="autor-libro">${t.autor}</p>
                    <span class="anio-libro">${t.anio}</span>
                </div>
            </div>
        `})}function p(e,t){e.stopPropagation();let n=l(),r=[];o=null,n.forEach(e=>{e.id==t?o=e:r.push(e)}),u(r),d(),m()}function m(){c.innerHTML=`Libro eliminado <button onclick="deshacerEliminar()">Deshacer</button>`,c.style.display=`block`,c.style.opacity=`1`,setTimeout(()=>{c.style.display=`none`,o=null},3e3)}function h(){if(o==null)return;let e=l();e.push(o),u(e),o=null,c.style.display=`none`,d()}function g(){l().length!=0&&_()}function _(){let e=document.createElement(`div`);e.className=`fondo-modal`,e.innerHTML=`
        <div class="tarjeta-modal modal-confirmacion">
            <h2>Eliminar favoritos</h2>
            <p>¿Seguro que querés borrar todos los libros guardados?</p>
            <div class="botones-confirmacion">
                <button class="boton-cancelar" onclick="cerrarModal()">Cancelar</button>
                <button class="boton-confirmar" onclick="confirmarEliminarTodos()">Sí, eliminar</button>
            </div>
        </div>
    `,e.addEventListener(`click`,t=>{t.target==e&&b()}),document.body.appendChild(e)}function v(){b(),u([]),o=null,c.style.display=`none`,a.value=`todos`,d()}function y(e){let t=l().find(t=>t.id==e),n=`<div class="modal-sin-portada">Sin portada</div>`;t.fotoId!=``&&(n=`<img src="https://covers.openlibrary.org/b/id/${t.fotoId}-L.jpg" alt="Portada">`);let r=document.createElement(`div`);r.className=`fondo-modal`,r.innerHTML=`
        <div class="tarjeta-modal detalle-libro">
            <button class="boton-cerrar-modal" onclick="cerrarModal()">Cerrar</button>
            <div class="modal-portada">${n}</div>
            <div class="modal-info">
                <h2>${t.titulo}</h2>
                <p><b>Autor:</b> ${t.autor}</p>
                <p><b>Año:</b> ${t.anio}</p>
                <p>Este libro esta guardado en tu lista de favoritos.</p>
                <a class="link-detalle" href="https://openlibrary.org${t.id}" target="_blank">Ver en Open Library</a>
            </div>
        </div>
    `,r.addEventListener(`click`,e=>{e.target==r&&b()}),document.body.appendChild(r)}function b(){let e=document.querySelector(`.fondo-modal`);e&&e.remove()}function x(e){s=e,S(`fav-btn-`+e),d()}function S(e){document.querySelectorAll(`#barra-filtros-fav .boton-orden`).forEach(e=>{e.classList.remove(`activo`)}),document.getElementById(e).classList.add(`activo`)}function C(e){let t=a.value,n=[];a.innerHTML=`<option value="todos">Todos los autores</option>`,e.forEach(e=>{!n.includes(e.autor)&&e.autor!=`Autor desconocido`&&n.push(e.autor)}),n.forEach(e=>{a.innerHTML+=`<option value="${e}">${e}</option>`}),a.value=t,a.value==``&&(a.value=`todos`)}function w(){let e=l().length;n.textContent=e,r.textContent=e}function T(e,t){let n=parseInt(e);return isNaN(n)?t:n}window.mostrarFavoritos=d,window.quitarFavorito=p,window.deshacerEliminar=h,window.eliminarTodosFavoritos=g,window.confirmarEliminarTodos=v,window.abrirDetalleFavorito=y,window.cerrarModal=b,window.ordenarFavoritosPor=x,d();