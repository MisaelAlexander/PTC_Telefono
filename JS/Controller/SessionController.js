import { me,logout } from "../Service/AuthService.js";

// Estado de la autenticación
export const auth = {
  ok: false,
  user: null,
};

export function ensureMenuLinks(shouldShow) {
  const mainMenu = document.getElementById("bottom-nav");
  if (shouldShow) {
    let botones = `
      <button id="Menu">
        <img src="IMG/Menu.png" alt="Menu" style="width:24px; height:24px; object-fit:contain;">
      </button>
    `;

    if (role.isVendedor()) {
      botones += `
        <button id="Gestionar">
          <img src="IMG/Gestionar.png" alt="Gestionar" style="width:24px; height:24px; object-fit:contain;">
        </button>
        <button id="Informacion">
          <img src="IMG/Personal.png" alt="Informacion" style="width:24px; height:24px; object-fit:contain;">
        </button>
      `;
    }

    if (role.isUsuario()) {
      botones += `
        <button id="Favoritos">
          <img src="IMG/Favoritos.png" alt="Favoritos" style="width:24px; height:24px; object-fit:contain;">
        </button>
        <button id="Gestionar">
          <img src="IMG/Gestionar.png" alt="Gestionar" style="width:24px; height:24px; object-fit:contain;">
        </button>
        <button id="Informacion">
          <img src="IMG/Personal.png" alt="Informacion" style="width:24px; height:24px; object-fit:contain;">
        </button>
      `;
    }

    mainMenu.innerHTML = botones;

    // Eventos
    document.getElementById("Menu")?.addEventListener("click", () => {
      window.location.href = "index.html";
    });
    document.getElementById("Informacion")?.addEventListener("click", () => {
      window.location.href = "Usuario.html";
    });
    document.getElementById("Favoritos")?.addEventListener("click", () => {
      window.location.href = "Favoritos.html";
    });
    document.getElementById("Gestionar")?.addEventListener("click", () => {
      window.location.href = "Visitas.html";
    });
  } else {
     window.location.replace("login.html");
         mainMenu.innerHTML = "";
  }
}

export async function renderUser() {
  try {
    const info = await me();
    auth.ok = !!info?.authenticated;
    auth.user = info?.user ?? null;

    if (auth.ok && (role.isUsuario() || role.isVendedor())) {
      ensureMenuLinks(true);
    } else {
      auth.ok = false;
      auth.user = null;
      ensureMenuLinks(false);
    }
  } catch {
    auth.ok = false;
    auth.user = null;
    ensureMenuLinks(false);
  }
}

export async function requireAuth({ redirect = true } = {}) {
  try {
    const info = await me();
    auth.ok = !!info?.authenticated;
    auth.user = info?.user ?? null;
  } catch {
    auth.ok = false;
    auth.user = null;
  }

  if (!auth.ok && redirect) {
    window.location.replace("login.html");
  }
  return auth.ok;
}

// Helpers
export function getUserRole() {
  return auth.user?.rol || "";
}

export function getUserID() {
  return auth.user?.idusuario || "";
}

export function getUserIDUBI() {
  return auth.user?.idubicacion || "";
}

export function hasAuthority(authority) {
  return Array.isArray(auth.user?.authorities)
    ? auth.user.authorities.includes(authority)
    : false;
}

export const role = {
  isVendedor: () =>
    getUserRole() === "Vendedor" || hasAuthority("ROLE_Vendedor"),

  isUsuario: () =>
    getUserRole() === "Usuario" || hasAuthority("ROLE_Usuario"),
};

window.addEventListener("pageshow", async () => {
  await renderUser();
});

// -------------------- LOGOUT CENTRAL --------------------
export async function cerrarSesion() {
  const ok = await logout();
  localStorage.removeItem("usuario");
  if (ok) {
    window.location.href = "login.html";
  } else {
    alert("Error al cerrar sesión. Intenta de nuevo.");
  }
}