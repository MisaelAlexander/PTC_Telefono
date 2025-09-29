import { renderUser, auth } from "../Controller/SessionController.js";
  import { 
    obtenerVisitasPorCliente, 
    obtenerVisitasPorTitulo, 
    obtenerTiposVisita,
    obtenerVisitasPorEstadoYCliente 
  } from "../Service/VisitaService.js";

  document.addEventListener("DOMContentLoaded", async () => {
    // ======= RENDERIZAR USUARIO =======
    await renderUser();
    if (!auth.ok) {
        mostrarNotificacion("Debes iniciar sesión para ver tus favoritos", "error");
        return;
    }

    const usuario = auth.user; // info cargada desde /me
    const lista = document.querySelector(".request-list");
    const pageSizeSelector = document.getElementById("pageSize");
    const pageNumbersContainer = document.getElementById("page-numbers");
    const searchInput = document.getElementById("searchTitle");
    const tiposContainer = document.getElementById("tipos-visita");

    let currentPage = 0;
    let totalPages = 1;
    let pageSize = parseInt(pageSizeSelector.value, 10);
    let currentSearch = "";
    let currentTipo = null; // tipo de visita seleccionado

    async function cargarVisitas(page = 0) {
      try {
        let response;

        if (currentSearch.trim() !== "") {
          // Buscar por título
          response = await obtenerVisitasPorTitulo(currentSearch, page, pageSize);
        } else if (currentTipo) {
          // Buscar por estado y cliente
          response = await obtenerVisitasPorEstadoYCliente(currentTipo, usuario.idusuario, page, pageSize);
        } else {
          // Todas las visitas del cliente
          response = await obtenerVisitasPorCliente(usuario.idusuario, page, pageSize);
        }

        const { content = [], totalPages: tp = 1, pageNumber: number = 0 } = response.data;
        totalPages = tp;
        currentPage = number;
        lista.innerHTML = "";

        if (content.length === 0) {
          lista.innerHTML = `<p>No se encontraron visitas.</p>`;
        } else {
          content.forEach(v => {
            const card = document.createElement("div");
            card.classList.add("request-card");

            if (v.estado === "Aceptado") {
              card.classList.add("estado-aceptado");
            } else if (v.estado === "Rechazado") {
              card.classList.add("estado-rechazado");
            } else if (v.estado === "En espera") {
              card.classList.add("estado-espera");
            }

            card.innerHTML = `
              <div class="request-info">
                <p class="client-name">${v.inmuebletitulo}</p>
                <p><strong>Precio:</strong> $${v.inmuebleprecio}</p>
                <p><strong>Fecha:</strong> ${v.fecha} - ${v.hora}</p>
                <p><strong>Estado:</strong> ${v.estado}</p>
                <p><strong>Tipo:</strong> ${v.tipovisita}</p>
              </div>
            `;
            lista.appendChild(card);
          });
        }

        renderizarNumeros();
      } catch (err) {
        lista.innerHTML = `<p style="color:red;">Error al cargar visitas</p>`;
      }
    }

    function renderizarNumeros() {
      pageNumbersContainer.innerHTML = "";
      const maxButtons = 5;
      const half = Math.floor(maxButtons / 2);
      let start = Math.max(0, currentPage - half);
      let end = Math.min(totalPages - 1, currentPage + half);

      if (currentPage <= half) {
        start = 0;
        end = Math.min(totalPages - 1, maxButtons - 1);
      }
      if (currentPage + half >= totalPages) {
        start = Math.max(0, totalPages - maxButtons);
        end = totalPages - 1;
      }

      const btnPrev = document.createElement("button");
      btnPrev.textContent = "Anterior";
      btnPrev.disabled = currentPage === 0;
      btnPrev.addEventListener("click", () => {
        if (currentPage > 0) cargarVisitas(currentPage - 1);
      });
      pageNumbersContainer.appendChild(btnPrev);

      for (let i = start; i <= end; i++) {
        const btn = document.createElement("button");
        btn.textContent = i + 1;
        btn.classList.add("page-btn");
        if (i === currentPage) btn.classList.add("activo");
        btn.addEventListener("click", () => cargarVisitas(i));
        pageNumbersContainer.appendChild(btn);
      }

      const btnNext = document.createElement("button");
      btnNext.textContent = "Siguiente";
      btnNext.disabled = currentPage === totalPages - 1;
      btnNext.addEventListener("click", () => {
        if (currentPage < totalPages - 1) cargarVisitas(currentPage + 1);
      });
      pageNumbersContainer.appendChild(btnNext);
    }

    // Renderizar botones de tipos de visita
    async function cargarTipos() {
      try {
        const tipos = await obtenerTiposVisita();
        tiposContainer.innerHTML = "";

        // Botón para mostrar todos
        const btnTodos = document.createElement("button");
        btnTodos.textContent = "Todos";
        btnTodos.classList.add("tipo-btn");
        btnTodos.addEventListener("click", () => {
          currentTipo = null;
          currentPage = 0;
          cargarVisitas(0);
        });
        tiposContainer.appendChild(btnTodos);

        tipos.forEach(t => {
          const btn = document.createElement("button");
          btn.textContent = t.estado; 
          btn.classList.add("tipo-btn");

          btn.addEventListener("click", () => {
            currentTipo = t.idEstado; // captura idEstado
            currentPage = 0;
            cargarVisitas(0);
          });

          tiposContainer.appendChild(btn);
        });
      } catch (err) {
        tiposContainer.innerHTML = "<p>Error al cargar tipos de visita</p>";
      }
    }

    // Eventos
    pageSizeSelector.addEventListener("change", () => {
      pageSize = parseInt(pageSizeSelector.value, 10);
      currentPage = 0;
      cargarVisitas(currentPage);
    });

    searchInput.addEventListener("input", () => {
      currentSearch = searchInput.value;
      currentPage = 0;
      cargarVisitas(currentPage);
    });

    await cargarTipos();   // primero carga botones
    await cargarVisitas(0); // luego carga visitas
  });
