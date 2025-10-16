// JS/Service/CrearVisitaService.js
const API_VIS = "https://arqosapi-9796070a345d.herokuapp.com/TipoVisita";
const API_INM = "https://arqosapi-9796070a345d.herokuapp.com/Visita";
const API_INMUEBLE = "https://arqosapi-9796070a345d.herokuapp.com/Inmueble";
const API_FOT = "https://arqosapi-9796070a345d.herokuapp.com/Foto";

export async function obtenerFotosPorInmuebleId(idInmueble) {
  try {
    const response = await fetch(`${API_FOT}/Mostrar/${idInmueble}`,{credentials: 'include'});
    if (!response.ok) throw new Error("No se pudieron cargar las fotos");
    const fotos = await response.json();
    return fotos;
  } catch (error) {
    console.error("Error obteniendo fotos:", error);
    return [];
  }
}

export async function obtenerVisitasPorInmueble(inmuebleId) {
  try {
    const response = await fetch(`${API_INM}/Inmueble/${inmuebleId}`,{credentials: 'include'});
    const result = await response.json();

    if (result.status && result.data) {
      return result.data; 
    }
    return [];
  } catch (error) {
    console.error("Error cargando visitas:", error);
    return [];
  }
}

// Nueva función para obtener solo visitas aceptadas
export async function obtenerVisitasAceptadasPorInmueble(inmuebleId) {
  try {
    // Obtener todas las visitas del inmueble
    const response = await fetch(`${API_INM}/Inmueble/${inmuebleId}`,{credentials: 'include'});
    const result = await response.json();

    if (result.status && result.data) {
      // Filtrar solo las visitas con estado "Aceptado" (id 1) y que sean futuras
      const ahora = new Date();
      const visitasAceptadas = result.data.filter(visita => {
        if (visita.idestado !== 1) return false; // Solo estado 1 (Aceptado)
        
        // Verificar si la visita es futura
        const fechaVisita = new Date(visita.fecha);
        if (visita.hora) {
          const [horas, minutos, segundos] = visita.hora.split(':');
          fechaVisita.setHours(parseInt(horas), parseInt(minutos), parseInt(segundos || 0));
        }
        
        return fechaVisita > ahora;
      });
      
      return visitasAceptadas;
    }
    return [];
  } catch (error) {
    console.error("Error cargando visitas aceptadas:", error);
    return [];
  }
}

export async function registrarVisita(payload) {
  try {
    const response = await fetch(`${API_INM}/Guardar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return await response.json(); 
  } catch (error) {
    console.error("Error guardando visita:", error);
    return null;
  }
}

export async function obtenerTiposVisita() {
  try {
    const response = await fetch(`${API_VIS}/Mostrar`,{credentials: 'include'});
    if (!response.ok) throw new Error("Error al obtener tipos de visita");
    return await response.json();
  } catch (error) {
    console.error("Error en obtenerTiposVisita:", error);
    return [];
  }
}

export async function obtenerInmueblePorId(inmuebleId) {
  try {
    const response = await fetch(`${API_INMUEBLE}/BuscarPorId/${inmuebleId}`,{credentials: 'include'});
    const result = await response.json();

    if (result.status && result.data) {
      return result.data; 
    }
    return null;
  } catch (error) {
    console.error("Error cargando inmueble:", error);
    return null;
  }
} 