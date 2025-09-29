const API_URL = "https://arqosapi-9796070a345d.herokuapp.com/Visita";
const API_URL_TIPO = "https://arqosapi-9796070a345d.herokuapp.com/Estado";

//Obtener visitas por cliente
export async function obtenerVisitasPorCliente(idUsuario, page = 0, size = 10)
{
try
{
    //equipo el await sirve para esperar que espera espera la respuesta de la url
    const response = await fetch(`${API_URL}/Cliente/${idUsuario}?page=${page}&size=${size}`,{credentials: 'include'});
    //si la respuesta es diferente de ok (que en resumen es que esta bien) se devuelve error
    if(!response.ok) throw new Error("Error al obtener visitas");
    //Espera la respesta del fetch en formato json
    const data = await response.json();
    //retornamos loq ue se nos mando con formato json
    return data;
}
catch(err)
{
    console.err("Error al cargar", err);
    throw err;
}    
}

// Obtener visitas por título
export async function obtenerVisitasPorTitulo(titulo, page = 0, size = 10) {
  try {
    const response = await fetch(`${API_URL}/BuscarPorTitulo?titulo=${encodeURIComponent(titulo)}&page=${page}&size=${size}`,{credentials: 'include'});
    if (!response.ok) throw new Error("Error al buscar visitas por título");
    return await response.json();
  } catch (err) {
    console.error("Error al buscar visitas por título", err);
    throw err;
  }
}


export async function obtenerTiposVisita() {
  try {
    const response = await fetch(`${API_URL_TIPO}/Mostrar`,{credentials: 'include'});
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
    const response = await fetch(`${API_URL}/EstadoCliente?idEstado=${idEstado}&idCliente=${idCliente}&page=${page}&size=${size}`,{credentials: 'include'});
    if (!response.ok) throw new Error("Error al obtener visitas por estado y cliente");
    return await response.json();
  } catch (err) {
    console.error("Error en obtenerVisitasPorEstadoYCliente", err);
    throw err;
  }
}
