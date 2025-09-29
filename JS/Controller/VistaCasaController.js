// JS/Controller/VistaCasaController.js
import { obtenerInmueblePorId, obtenerFotosPorInmuebleId } from "../Service/VistaCasaService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    console.error("No se encontró un ID en la URL");
    return;
  }

  // Obtener datos del inmueble
  const inmueble = await obtenerInmueblePorId(id);
  console.log("Inmueble", inmueble);
  if (!inmueble) {
    console.error("No se pudo cargar el inmueble");
    return;
  }

  // Obtener fotos del inmueble por separado
  const fotos = await obtenerFotosPorInmuebleId(id);

  // Pintar slider de imágenes dinámico
  const sliderContainer = document.querySelector(".slides-container");
const dotsContainer = document.querySelector(".dots");

if (sliderContainer) {
  sliderContainer.innerHTML = ""; // limpiar
  dotsContainer.innerHTML = "";

  if (!fotos || fotos.length === 0) {
    sliderContainer.innerHTML = '<img src="IMG/default-house.png" alt="Sin imagen">';
  } else if (fotos.length === 1) {
    // Solo una imagen: mostrar estática
    const img = document.createElement("img");
    img.src = fotos[0].foto ? fotos[0].foto : `/PTC_Telefono/foto/${fotos[0].nombre}`;
    img.alt = inmueble.titulo || "Imagen de inmueble";
    img.classList.add("active");
    sliderContainer.appendChild(img);
  } else {
    // Varias imágenes: activar carrusel
    let currentSlide = 0;

    fotos.forEach((foto, index) => {
      const img = document.createElement("img");
      img.src = foto.foto ? foto.foto : `/PTC_Telefono/foto/${foto.nombre}`;
      img.alt = inmueble.titulo || "Imagen de inmueble";
      if (index === 0) img.classList.add("active");
      sliderContainer.appendChild(img);

      const dot = document.createElement("span");
      dot.className = "dot";
      if (index === 0) dot.classList.add("active");
      dot.addEventListener("click", () => showSlide(index));
      dotsContainer.appendChild(dot);
    });

    const slides = sliderContainer.querySelectorAll("img");
    const dots = dotsContainer.querySelectorAll(".dot");

    function showSlide(n) {
      slides.forEach(s => s.classList.remove("active"));
      dots.forEach(d => d.classList.remove("active"));
      slides[n].classList.add("active");
      dots[n].classList.add("active");
      currentSlide = n;
    }

    // Botones next/prev solo si hay más de 1 imagen
    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");

    if (nextBtn && prevBtn) {
      nextBtn.addEventListener("click", () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      });
      prevBtn.addEventListener("click", () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
      });
    }

    // Cambio automático solo si hay más de 1 imagen
    if (slides.length > 1) {
      setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      }, 5000);
    }
  }
}

  // Avatar del vendedor
const avatar = document.querySelector(".seller-info .avatar");
if (avatar) {
  avatar.src = inmueble.usuariofoto || "";
  avatar.alt = inmueble.usuarionombre || "Avatar del vendedor";

  // Click en avatar para ir al perfil del usuario
  avatar.style.cursor = "pointer"; // cambia el cursor al pasar sobre la imagen
  avatar.addEventListener("click", () => {
    // Redirige a una página de perfil usando el id del usuario
    window.location.href = `ComentariosUsuario.html?id=${inmueble.idusuario}`;
  });
}

  // Info del vendedor
  const sellerName = document.querySelector(".seller-info h3");
  const sellerCorreo = document.querySelector(".seller-info .username");
  if (sellerName) sellerName.textContent = inmueble.usuarionombre || "Sin nombre";
  if (sellerCorreo) sellerCorreo.textContent = inmueble.usuariocorreo || "No disponible";

  // Tipo + ubicación
  const tipoNode = document.querySelector(".location-info .username");
  if (tipoNode) tipoNode.textContent = inmueble.tipo || "No especificado";

  const addressNodes = document.querySelectorAll(".location-info .address");
  if (addressNodes.length >= 2) {
    addressNodes[0].textContent = inmueble.ubicacion || "No disponible";
    addressNodes[1].textContent = `Nombre: ${inmueble.titulo}`;
  }

  // Info de la casa (habitaciones y baños)
  const houseInfo = document.querySelector(".house-info");
  if (houseInfo) {
    houseInfo.innerHTML = `
      <p> ${inmueble.habitaciones || 0} Habitaciones</p>
      <p> ${inmueble.banios || 0} Baños</p>
    `;
  }

  // Descripción y precio
  const descripcionNode = document.querySelector(".descriptions p");
  if (descripcionNode) descripcionNode.textContent = inmueble.descripcion || "Sin descripción";

  const priceNode = document.querySelector(".price-buy .price");
  if (priceNode) priceNode.textContent = `$${Number(inmueble.precio || 0).toLocaleString()}`;

  // Contacto
  const waLink = document.querySelector(".contact-info a[href^='https://wa.me']"); 
  const mailLink = document.querySelector(".contact-info a[href^='mailto']");
  if (waLink) {
    waLink.href = `https://wa.me/${inmueble.usuariotelefono || ""}`;
    waLink.textContent = inmueble.usuariotelefono || "";
  }
  if (mailLink) {
    mailLink.href = `mailto:${inmueble.usuariocorreo || ""}`;
    mailLink.textContent = inmueble.usuariocorreo || "";
  }

  //  Mapa dinámico con lat/lon
  const mapaContainer = document.querySelector(".map-box iframe");
  if (mapaContainer && inmueble.latitud && inmueble.longitud) {
    mapaContainer.src = `https://www.google.com/maps?q=${inmueble.latitud},${inmueble.longitud}&hl=es&z=16&output=embed`;
  }
   const orgBtn = document.getElementById("orgBtn");
  const commentsBtn = document.getElementById("commentsBtn");

  if (orgBtn) {
    orgBtn.addEventListener("click", () => {
      window.location.href = `OrganizarVisita.html?id=${id}`;
    });
  }

  if (commentsBtn) {
    commentsBtn.addEventListener("click", () => {
      window.location.href = `Comentarios.html?id=${id}`;
    });
  }


 
});
