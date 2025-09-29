  // Inmuebled
const API_INM = "https://arqosapi-9796070a345d.herokuapp.com/Inmueble";

//Funcion para obtener inmuebles por ubicación(para uusarios)
export async function obtenerInmueblesPorUbicacion(ubicacion, page = 0, size = 1) {
  //Usamos un try-catch para manejar errores
  try {
    //Esperamosrespuesta del servidor
   const resp = await fetch(
  `${API_INM}/BuscarporUbi?ubicacion=${encodeURIComponent(ubicacion)}&page=${page}&size=${size}`,
  {
    method: "GET",
    credentials: "include" //  necesario para que se envíe la cookie
  }
);

    //Si la respuesta es erronea, lanzamos un error
    if (!resp.ok) throw new Error("Error al obtener inmuebles");

    //Si la respuesta es correcta, convertimos a JSON y retornamos el contenido
    const data = await resp.json();
    // content trae el listado de inmuebles
    return data.data.content; 
  }
  //Si hay un error, lo mostramos en consola y retornamos un array vacio 
  catch (err) 
  {
    //Mostramos el error en consola
    console.error("Error en obtenerInmueblesPorUbicacion:", err);
    //Retornamos un array vacio (Nos servira para mostrar el mensaje ssi no hay casas)
    return [];
  }
}


// Favoritos
const API_FAV = "https://arqosapi-9796070a345d.herokuapp.com/Favorito";

//Funcion para guardar un inmueble como favorito
export async function guardarFavorito(usuarioId, inmuebleId) 
{
  // Usamos un try-catch para manejar errores
  try
  {
    // Hacemos la solicitud POST al servidor
    const resp = await fetch(`${API_FAV}/Guardar`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      // Enviamos el ID del inmueble y del usuario en el cuerpo de la solicitud
       body: JSON.stringify({
        idUsuario: usuarioId,      // coincide con el DTO
        idInmueble: inmuebleId     // coincide con el DTO
      })
    });
    if (!resp.ok) {
      throw new Error("Error en la petición al guardar favorito");
    }

    //  aquí parseamos la respuesta
    const data = await resp.json();
    return data; // retornamos lo que mande el backend
  }
  catch (err)
  {
    console.error("Error al guardar favorito:", err);
    return null;
  }
}

//Eliminar un favorito
export async function eliminarFavorito(idFavorito) {
  // Usamos un try-catch para manejar errores
  try {
    // Hacemos la solicitud DELETE al servidor
    const resp = await fetch(`${API_FAV}/Eliminar/${idFavorito}`, {
      method: "DELETE",
            credentials: "include",
    });
    // Si la respuesta no es correcta, lanzamos un error
    if (!resp.ok) {
      throw new Error("Error al eliminar favorito");
    }
    // Si todo salió bien, retornamos true
    return true; // si todo salió bien
  } catch (err) {
    console.error("Error al eliminar favorito:", err);
    return false;
  }
}

// Obtener favoritos por usuario(Sirve apra cargarlo con al estrelllita)
export async function obtenerFavoritos(idUsuario) {
  // Usamos un try-catch para manejar errores
  try {
    // Hacemos la solicitud GET al servidor
    const resp = await fetch(`${API_FAV}/Usuario/${idUsuario}`,
      {
    method: "GET",
    credentials: "include" //  necesario para que se envíe la cookie
  }
    );
    // Si la respuesta no es correcta, lanzamos un error
    if (!resp.ok) throw new Error("Error al obtener favoritos");
    // Convertimos la respuesta a JSON
    const json = await resp.json();
    // Extraemos el array del pageable
    return Array.isArray(json.data?.content) ? json.data.content : [];
  } catch (err) {
    console.error("Error al obtener favoritos:", err);
    return [];
  }
}


//Cargar fotito
// Como fucniona, ahorito lo explico
//Esto e sapra obtene rla foto de un inmueble por su ID
//Era ams sencillo crearlo asi en la api
export async function obtenerFotoInmueble(idInmueble) 
{
  // Usamos un try-catch para manejar errores
  try {
    // Hacemos la solicitud GET al servidor
    const resp = await fetch(`https://arqosapi-9796070a345d.herokuapp.com/Foto/Mostrar/${idInmueble}`,
      {
    method: "GET",
    credentials: "include" //  necesario para que se envíe la cookie
  }
    );
    // Si la respuesta no es correcta, lanzamos un error
    if (!resp.ok) throw new Error("Error al obtener fotos");
    // Convertimos la respuesta a JSON
    const fotos = await resp.json();
    // Retornamos la primera foto si existe, si no la imagen de fallback
    return fotos.length > 0 ? fotos[0].foto : "IMG/logo.png";
  } 
  catch (err) 
  {
    console.error("Error al cargar foto:", err);
    return "IMG/Imativa_Casa_Carrasco_0013.webp"; // fallback
  }
}
