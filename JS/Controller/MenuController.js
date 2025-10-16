import { 
  obtenerInmueblesPorUbicacion, 
  guardarFavorito, 
  eliminarFavorito, 
  obtenerFavoritos,
  obtenerFotoInmueble,
  obtenerUsuarioPorId
} from "../Service/MenuService.js";

import { guardarHistorial } from "../Service/HistorialService.js";
import { requireAuth, role, auth } from "../Controller/SessionController.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Verificar sesión
    const ok = await requireAuth();
    if (!ok) {
      window.location.href = "login.html";
      return;
    }

    const id = auth.user.id;
    const usuario = await obtenerUsuarioPorId(id);

    // Cargar botón Propiedades
    document.getElementById("propiedades").addEventListener("click", () => {
      window.location.href = "Propiedades.html";
    });

    const cartaContainer = document.getElementById("carta");

    // Cargar foto de perfil
    const avatar = document.querySelector(".avatar");
    avatar.src = usuario.fotoPerfil || "IMG/Imativa_Casa_Carrasco_0013.webp";

    // Cargar nombre en el saludo
    const welcome = document.querySelector(".welcome");
    welcome.textContent = `Hola, ${usuario.nombre}`;

    if (!usuario.ubicacion) {
      cartaContainer.innerHTML = "<p>No se pudo obtener la ubicación del usuario.</p>";
      return;
    }

    // Obtenemos inmuebles por ubicación
    let inmuebles = await obtenerInmueblesPorUbicacion(usuario.ubicacion, 0, 1);
    inmuebles = inmuebles.filter(casa => casa.estado === true);

    if (inmuebles.length === 0) {
      cartaContainer.innerHTML = `
        <div class="mensaje-vacio">
          <img src="IMG/Menu.png" alt="No se" class="icono-vacio"/>
          <h3>No hay casas registradas en tu departamento</h3>
          <p>Pronto tendremos opciones disponibles para ti.</p>
        </div>`;
      return;
    }

    const casa = inmuebles[0];
    const foto = await obtenerFotoInmueble(casa.idinmuebles);

    // ===============================
    // VERIFICAR SI YA ESTÁ EN FAVORITOS (CORREGIDO)
    // ===============================
    let esFavorito = false;
    let idFavoritoExistente = null;

    if (role.isUsuario()) {
      const favoritos = await obtenerFavoritos(usuario.idusuario);
      console.log("Favoritos del usuario:", favoritos); // Para debug
      console.log("ID de la casa:", casa.idinmuebles); // Para debug
      
      // Buscar si esta casa está en favoritos - CORREGIDO
      const favoritoExistente = favoritos.find(fav => {
        // Verificar ambas posibles propiedades que podría tener el objeto favorito
        return fav.idinmuebles === casa.idinmuebles || 
               fav.idInmueble === casa.idinmuebles;
      });
      
      if (favoritoExistente) {
        esFavorito = true;
        // Usar la propiedad correcta del id del favorito
        idFavoritoExistente = favoritoExistente.idfavoritos || favoritoExistente.idFavorito;
      }
    }

    // Pintamos la carta con el inmueble
    cartaContainer.innerHTML = `
      <div class="card" id="card${casa.idinmuebles}">
        <img src="${foto}" alt="${casa.titulo}" />
        <div class="info">
          ${role.isUsuario() ? `
          <div class="star-favorite">
            <input type="checkbox" id="fav${casa.idinmuebles}" ${esFavorito ? 'checked' : ''} />
            <label for="fav${casa.idinmuebles}">&#9733;</label>
          </div>` : ""}
          <h3>${casa.titulo}</h3>
          <p>Ubicación: ${casa.ubicacion}</p>
          <p>Precio: $${casa.precio.toLocaleString()}</p>
          <p>${casa.habitaciones} habitaciones, ${casa.banios} baños</p>
        </div>
      </div>
    `;

    // === Historial general ===
    async function guardarVistaEnHistorial(casa) {
      try {
        const fechaManana = new Date();
        fechaManana.setDate(fechaManana.getDate() + 1);

        const datosHistorial = {
          descripcion: `Has visto la casa "${casa.titulo}"`,
          fecha: fechaManana.toISOString(),
          idUsuario: usuario.idusuario
        };

        await guardarHistorial(datosHistorial);
      } catch (error) {
        console.error("Error al guardar en historial:", error);
      }
    }

    // Evento click en la card completa (EXCLUYENDO la estrella)
    const card = document.getElementById(`card${casa.idinmuebles}`);
    card.addEventListener("click", (e) => {
      // Verificar si el click NO fue en la estrella o sus elementos hijos
      if (!e.target.closest('.star-favorite')) {
        guardarVistaEnHistorial(casa);
        window.location.href = `VistaCasa.html?id=${casa.idinmuebles}`;
      }
    });

    // ===============================
    // SOLO SI EL ROL ES USUARIO 
    // ===============================
    if (role.isUsuario()) {
      // Historial de favoritos
      async function guardarFavoritosHistorial(casa) {
        try {
          const fechaManana = new Date();
          fechaManana.setDate(fechaManana.getDate() + 1);

          const datosHistorial = {
            descripcion: `Has agregado de favoritos la casa "${casa.titulo}"`,
            fecha: fechaManana.toISOString(),
            idUsuario: usuario.idusuario
          };

          await guardarHistorial(datosHistorial);
        } catch (error) {
          console.error("Error al guardar en historial:", error);
        }
      }

      async function eliminarFavoritosHistorial(casa) {
        try {
          const fechaManana = new Date();
          fechaManana.setDate(fechaManana.getDate() + 1);

          const datosHistorial = {
            descripcion: `Has eliminado de favoritos la casa "${casa.titulo}"`,
            fecha: fechaManana.toISOString(),
            idUsuario: usuario.idusuario
          };

          await guardarHistorial(datosHistorial);
        } catch (error) {
          console.error("Error al guardar en historial:", error);
        }
      }

      const checkbox = document.getElementById(`fav${casa.idinmuebles}`);
      const starContainer = checkbox.closest('.star-favorite');

      // Si ya estaba en favoritos, guardamos el id en el dataset (CORREGIDO)
      if (esFavorito && idFavoritoExistente) {
        checkbox.dataset.idFavorito = idFavoritoExistente; // Usar idFavorito como en el ejemplo
      }

      // Prevenir que el click en la estrella active el evento de la card
      starContainer.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // Evento cuando cambia el estado del checkbox (CORREGIDO)
      checkbox.addEventListener("change", async (e) => {
        if (e.target.checked) {
          // Agregar a favoritos
          const favorito = await guardarFavorito(usuario.idusuario, casa.idinmuebles);
          if (favorito) {
            // Usar la misma propiedad que en el ejemplo
            e.target.dataset.idFavorito = favorito.idFavorito || favorito.idfavoritos;
            guardarFavoritosHistorial(casa);
          } else {
            e.target.checked = false;
          }
        } else {
          // Eliminar de favoritos
          const idFavorito = e.target.dataset.idFavorito; // Usar idFavorito como en el ejemplo
          if (idFavorito) {
            const eliminado = await eliminarFavorito(idFavorito);
            if (eliminado) {
              delete e.target.dataset.idFavorito;
              eliminarFavoritosHistorial(casa);
            } else {
              e.target.checked = true;
            }
          }
        }
      });
    }
    // ===============================

    // Funcion para "Cerca de ti"
    document.getElementById("cercaDeTi").addEventListener("click", async () => {
      if (usuario && usuario.idubicacion) {
        localStorage.setItem("ubicacion", usuario.idubicacion);
        window.location.href = `Propiedades.html?ubicacion=${usuario.idubicacion}`;
      } else {
        alert("No se pudo obtener tu ubicación.");
      }
    });

  } catch (error) {
    console.error("Error en MenuController:", error);
    // window.location.href = "login.html";
  }
});