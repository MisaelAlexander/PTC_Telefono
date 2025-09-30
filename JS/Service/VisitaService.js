const API_URL = "https://arqosapi-9796070a345d.herokuapp.com/Visita";
const API_URL_TIPO = "https://arqosapi-9796070a345d.herokuapp.com/Estado";

// Obtener visitas por cliente
export async function obtenerVisitasPorCliente(idUsuario, page = 0, size = 10) {
  try {
    const response = await fetch(`${API_URL}/Cliente/${idUsuario}?page=${page}&size=${size}`,{credentials:"include"});
    if (!response.ok) throw new Error("Error al obtener visitas");
    return await response.json();
  } catch (err) {
    console.error("Error al cargar", err);
    throw err;
  }
}

// Obtener visitas por cliente
export async function obtenerVisitasPorVendedor(idUsuario, page = 0, size = 10) {
  try {
    const response = await fetch(`${API_URL}/Vendedor/${idUsuario}?page=${page}&size=${size}`,{credentials:"include"});
    if (!response.ok) throw new Error("Error al obtener visitas");
    return await response.json();
  } catch (err) {
    console.error("Error al cargar", err);
    throw err;
  }
}

//  Obtener visitas por título (con cliente incluido)
export async function obtenerVisitasPorTitulo(titulo, idUsuario, page = 0, size = 10) {
  try {
    const response = await fetch(
      `${API_URL}/BuscarPorTitulo?titulo=${encodeURIComponent(titulo)}&idUsuario=${idUsuario}&page=${page}&size=${size}`,{credentials:"include"}
    );
    if (!response.ok) throw new Error("Error al buscar visitas por título");
    return await response.json();
  } catch (err) {
    console.error("Error al buscar visitas por título", err);
    throw err;
  }
}

export async function obtenerTiposVisita() {
  try {
    const response = await fetch(`${API_URL_TIPO}/Mostrar`,{credentials:"include"});
    if (!response.ok) throw new Error("Error al obtener tipos de visita");
    return await response.json();
  } catch (err) {
    console.error("Error en obtenerTiposVisita", err);
    throw err;
  }
}

// Obtener visitas por estado y cliente
export async function obtenerVisitasPorEstadoYCliente(idEstado, idCliente, page = 0, size = 10) {
  try {
    const response = await fetch(`${API_URL}/EstadoCliente?idEstado=${idEstado}&idCliente=${idCliente}&page=${page}&size=${size}`,{credentials:"include"});
    if (!response.ok) throw new Error("Error al obtener visitas por estado y cliente");
    return await response.json();
  } catch (err) {
    console.error("Error en obtenerVisitasPorEstadoYCliente", err);
    throw err;
  }
}

// Obtener visitas por estado y cliente
export async function obtenerVisitasPorEstadoYVendedor(idEstado, idCliente, page = 0, size = 10) {
  try {
    const response = await fetch(`${API_URL}/EstadoVendedor?idEstado=${idEstado}&idVendedor=${idCliente}&page=${page}&size=${size}`,{credentials:"include"});
    if (!response.ok) throw new Error("Error al obtener visitas por estado y cliente");
    return await response.json();
  } catch (err) {
    console.error("Error en obtenerVisitasPorEstadoYCliente", err);
    throw err;
  }
}


// Actualizar visita
export async function actualizarVisita(id, data) {
  try {
    const resp = await fetch(`${API_URL}/Actualizar/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
      credentials:"include"
    });

    if (!resp.ok) throw new Error("Error al actualizar la visita");

    return await resp.json();
  } catch (error) {
    console.error("Error en actualizarVisita:", error);
    return null;
  }
}
