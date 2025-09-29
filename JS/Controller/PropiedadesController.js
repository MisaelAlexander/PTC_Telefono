import { 
  mostrarInmuebles, 
  mostrarInmueblesPorTipo,
  mostrarInmueblesPorUbi,
  mostrarInmueblesPorUbiYTipo,
  mostrarInmueblesPorBusqueda,
  mostrarInmueblesPorUsuario,
  mostrarInmueblesPorUbiYUser,
  mostrarInmueblesPorTipYUser,
  mostrarInmueblesPorTituloYUser,
  mostrarInmueblesPorUbiYTipoYUser,
  obtenerTipos,
  obtenerUbicaciones,
  guardarFavorito, 
  eliminarFavorito, 
  obtenerFavoritos,
  obtenerFotoInmueble,
  eliminarInmueble
} from "../Service/PropiedadesService.js";

import { guardarHistorial } from "../Service/HistorialService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
   console.log("Datos del usuario:", userData);
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  const rol = usuario.rol; // "Usuario" o "Vendedor"

  const selectSize = document.getElementById("selectSize");
  const ubicacionSelect = document.getElementById("ubicacionSelect");
  const buscador = document.getElementById("buscadorInput");
  const btnBuscar = document.getElementById("btnBuscar");
  const main = document.querySelector(".content-scroll");
  const pagContainer = document.getElementById("paginacion");
  const filtersContainer = document.getElementById("filters");

  let currentPage = 0;
  let currentSize = parseInt(selectSize.value);
  let totalPages = 0;

  let tipo = null;
  let ubicacion = null;
  let textoBusqueda = "";

  const params = new URLSearchParams(window.location.search);
  if (params.has("tipo")) tipo = params.get("tipo");
  if (params.has("ubicacion")) ubicacion = params.get("ubicacion");

  // Favoritos solo para usuario
  let favoritosUsuario = [];
  if (rol === "Usuario") favoritosUsuario = await obtenerFavoritos(usuario.idusuario);

  // Cargar tipos como botones
  try {
    const tipos = await obtenerTipos();
    filtersContainer.innerHTML = "";

    const btnTodos = document.createElement("button");
    btnTodos.textContent = "Todos";
    btnTodos.addEventListener("click", () => {
      tipo = null;
      ubicacion = null;
      textoBusqueda = "";
      currentPage = 0;
      ubicacionSelect.value = "";
      buscador.value = "";
      document.querySelectorAll("#filters button").forEach(b => b.classList.remove("activo"));
      cargarInmuebles();
    });
    filtersContainer.appendChild(btnTodos);

    tipos.forEach(t => {
      const btn = document.createElement("button");
      btn.textContent = t.tipo;
      if (tipo == t.idtipo) btn.classList.add("activo");
      btn.addEventListener("click", () => {
        tipo = t.idtipo;
        textoBusqueda = "";
        currentPage = 0;
        document.querySelectorAll("#filters button").forEach(b => b.classList.remove("activo"));
        btn.classList.add("activo");
        buscador.value = "";
        cargarInmuebles();
      });
      filtersContainer.appendChild(btn);
    });
  } catch (error) {
    console.error("Error cargando tipos:", error);
  }

  // Cargar ubicaciones en select
  try {
    const ubicaciones = await obtenerUbicaciones();
    ubicaciones.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.idubicacion;
      opt.textContent = u.ubicacion;
      ubicacionSelect.appendChild(opt);
    });

    if (ubicacion) ubicacionSelect.value = ubicacion;

    ubicacionSelect.addEventListener("change", () => {
      ubicacion = ubicacionSelect.value || null;
      textoBusqueda = "";
      currentPage = 0;
      buscador.value = "";
      cargarInmuebles();
    });
  } catch (error) {
    console.error("Error cargando ubicaciones:", error);
  }

  // Función debounce
  function debounce(fn, delay) {
    let timeoutID;
    return function(...args) {
      clearTimeout(timeoutID);
      timeoutID = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  const ejecutarBusqueda = debounce(() => {
    textoBusqueda = buscador.value.trim();
    tipo = null;
    ubicacion = null;
    currentPage = 0;
    ubicacionSelect.value = "";
    document.querySelectorAll("#filters button").forEach(b => b.classList.remove("activo"));
    cargarInmuebles();
  }, 250);
  buscador.addEventListener("input", ejecutarBusqueda);

  // Historial
  async function guardarVistaEnHistorial(casa, accion) {
    if (!usuario || rol !== "Usuario") return;
    try {
      const fechaManana = new Date();
      fechaManana.setDate(fechaManana.getDate() + 1);
      await guardarHistorial({
        descripcion: `Has ${accion} la casa "${casa.titulo}"`,
        fecha: fechaManana.toISOString(),
        idUsuario: usuario.idusuario
      });
    } catch (error) { console.error(error); }
  }

  // Cargar inmuebles
  async function cargarInmuebles(page = 0, size = currentSize) {
    main.innerHTML = "";
    try {
      let response;

      if (rol === "Usuario") {
        if (textoBusqueda) response = await mostrarInmueblesPorBusqueda(textoBusqueda, page, size);
        else if (tipo && ubicacion) response = await mostrarInmueblesPorUbiYTipo(ubicacion, tipo, page, size);
        else if (tipo) response = await mostrarInmueblesPorTipo(tipo, page, size);
        else if (ubicacion) response = await mostrarInmueblesPorUbi(ubicacion, page, size);
        else response = await mostrarInmuebles(page, size);
      } else if (rol === "Vendedor") {
        if (textoBusqueda) response = await mostrarInmueblesPorTituloYUser(textoBusqueda, usuario.idusuario, page, size);
        else if (tipo && ubicacion) response = await mostrarInmueblesPorUbiYTipoYUser(ubicacion, tipo, usuario.idusuario, page, size);
        else if (tipo) response = await mostrarInmueblesPorTipYUser(tipo, usuario.idusuario, page, size);
        else if (ubicacion) response = await mostrarInmueblesPorUbiYUser(ubicacion, usuario.idusuario, page, size);
        else response = await mostrarInmueblesPorUsuario(usuario.idusuario, page, size);
      }

      if (!response || !response.content || response.content.length === 0) {
        main.innerHTML = `  <div class="no-resultados">
    <div class="no-resultados-icon"><ion-icon name="home-outline"></ion-icon></div>
    <p>No hay inmuebles disponibles</p>
    <span>Intenta cambiar los filtros o la búsqueda</span>
  </div>
`;
        pagContainer.innerHTML = "";
        return;
      }

      const inmuebles = response.content;
      totalPages = response.totalPages;
      currentPage = response.pageNumber;

     for (let casa of inmuebles) {
  const foto = await obtenerFotoInmueble(casa.idinmuebles);
  const card = document.createElement("section");
  card.classList.add("card", "carta");
  card.innerHTML = `
    <img src="${foto}" alt="${casa.titulo}" />
    <div class="info">
      ${rol === "Usuario" ? `
      <div class="star-favorite">
        <input type="checkbox" id="fav${casa.idinmuebles}" />
        <label for="fav${casa.idinmuebles}">&#9733;</label>
      </div>` : ""}
      <h3>${casa.titulo}</h3>
      <p>Ubicación: ${casa.ubicacion}</p>
      <p>Precio: $${casa.precio.toLocaleString()}</p>
      <p>${casa.habitaciones} habitaciones, ${casa.banios} baños</p>
      ${rol === "Vendedor" ? `
      <div class="acciones-vendedor">
        <button class="btn-actualizar">Actualizar</button>
        <button class="btn-eliminar">Eliminar</button>
      </div>` : ""}
    </div>
  `;
  main.appendChild(card);

  // Acción general de click en la card
  card.addEventListener("click", () => {
    guardarVistaEnHistorial(casa, "visto");
    window.location.href = `VistaCasa.html?id=${casa.idinmuebles}`;
  });

  // Si es vendedor, botones actualizar/eliminar
  if (rol === "Vendedor") {
    const btnActualizar = card.querySelector(".btn-actualizar");
    const btnEliminar = card.querySelector(".btn-eliminar");

    // Evitamos que al dar click en botones se abra la vista
 btnActualizar.addEventListener("click", (e) => {
  e.stopPropagation();
  // Redirigir al formulario de edición pasando el ID
  window.location.href = `Publicar.html?id=${casa.idinmuebles}`;
});

    btnEliminar.addEventListener("click", async (e) => {
  e.stopPropagation();
  const confirmado = confirm(`¿Seguro que deseas eliminar "${casa.titulo}"?`);
  if (!confirmado) return;

  const eliminado = await eliminarInmueble(casa.idinmuebles);
  if (eliminado) {
    alert("Inmueble eliminado correctamente");
    card.remove(); // quita la card de la vista
    //podemos refrescar pero asi es mas corto
    // cargarInmuebles(currentPage, currentSize);
  } else {
    alert("Ocurrió un error al eliminar el inmueble");
  }
});

  }

  // Si es usuario, lógica de favoritos
  if (rol === "Usuario") {
    const checkbox = card.querySelector(`#fav${casa.idinmuebles}`);
    const label = card.querySelector(`label[for="fav${casa.idinmuebles}"]`);
    checkbox.addEventListener("click", (e) => e.stopPropagation());
    label.addEventListener("click", (e) => e.stopPropagation());

    const favoritoExistente = favoritosUsuario.find(fav => fav.idInmueble === casa.idinmuebles);
    if (favoritoExistente) {
      checkbox.checked = true;
      checkbox.dataset.idFavorito = favoritoExistente.idFavorito;
    }

    checkbox.addEventListener("change", async (e) => {
      if (!usuario) { alert("Debes iniciar sesión para guardar favoritos"); e.target.checked = false; return; }
      if (e.target.checked) {
        const nuevoFav = await guardarFavorito(usuario.idusuario, casa.idinmuebles);
        if (nuevoFav) checkbox.dataset.idFavorito = nuevoFav.idFavorito;
        guardarVistaEnHistorial(casa, "agregado de favoritos");
      } else {
        const idFavorito = checkbox.dataset.idFavorito;
        if (idFavorito) await eliminarFavorito(idFavorito);
        guardarVistaEnHistorial(casa, "eliminado de favoritos");
      }
    });
  }
}


      actualizarPaginacion();
    } catch (error) {
      console.error(error);
      main.innerHTML = `<div class="no-resultados error"><p>Error cargando inmuebles, intenta nuevamente.</p></div>`;
    }
  }

  // Paginación
  function actualizarPaginacion() {
    pagContainer.innerHTML = "";
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(0, currentPage - half);
    let end = Math.min(totalPages - 1, currentPage + half);

    if (currentPage <= half) { start = 0; end = Math.min(totalPages - 1, maxButtons - 1); }
    if (currentPage + half >= totalPages) { start = Math.max(0, totalPages - maxButtons); end = totalPages - 1; }

    const btnPrev = document.createElement("button");
    btnPrev.textContent = "Anterior";
    btnPrev.disabled = currentPage === 0;
    btnPrev.addEventListener("click", () => { if(currentPage > 0) cargarInmuebles(currentPage - 1, currentSize); });
    pagContainer.appendChild(btnPrev);

    for (let i = start; i <= end; i++) {
      const btn = document.createElement("button");
      btn.textContent = i + 1;
      if(i === currentPage) btn.classList.add("activo");
      btn.addEventListener("click", () => cargarInmuebles(i, currentSize));
      pagContainer.appendChild(btn);
    }

    const btnNext = document.createElement("button");
    btnNext.textContent = "Siguiente";
    btnNext.disabled = currentPage === totalPages - 1;
    btnNext.addEventListener("click", () => { if(currentPage < totalPages - 1) cargarInmuebles(currentPage + 1, currentSize); });
    pagContainer.appendChild(btnNext);
  }

  selectSize.addEventListener("change", () => {
    currentSize = parseInt(selectSize.value);
    currentPage = 0;
    cargarInmuebles(currentPage, currentSize);
  });

  // Primera carga
  cargarInmuebles();
});
