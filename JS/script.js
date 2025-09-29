import { UsuarioService } from './Service/UsuarioDService.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await UsuarioService.getCurrentUser();
        if (!response.authenticated) {
            window.location.href = "Visitas.html";
            return;
        }

        const usuario = response.user;
        const nav = document.querySelector(".bottom-nav");

        // Siempre inicio
        let botones = `
            <button id="Menu">
                <img src="IMG/Menu.png" alt="Menu" style="width:24px; height:24px; object-fit:contain;">
            </button>
        `;

        // Menú según rol
        if (usuario.rol === "Vendedor") {
            botones += `
                <button id="Gestionar">
                    <img src="IMG/Gestionar.png" alt="Gestionar" style="width:24px; height:24px; object-fit:contain;">
                </button>
                <button id="Informacion">
                    <img src="IMG/Personal.png" alt="Informacion" style="width:24px; height:24px; object-fit:contain;">
                </button>
            `;
        } else if (usuario.rol === "Usuario") {
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

        nav.innerHTML = botones;

        // Eventos de los botones
        document.getElementById("Menu").addEventListener("click", () => {
            window.location.href = "index.html";
        });

        const infoBtn = document.getElementById("Informacion");
        if (infoBtn) {
            infoBtn.addEventListener("click", () => {
                window.location.href = "Usuario.html";
            });
        }

        const favBtn = document.getElementById("Favoritos");
        if (favBtn) {
            favBtn.addEventListener("click", () => {
                window.location.href = "Favoritos.html";
            });
        }

        const gestionarBtn = document.getElementById("Gestionar");
        if (gestionarBtn) {
            gestionarBtn.addEventListener("click", () => {
                window.location.href = "Visitas.html";
            });
        }

    } catch (error) {
        console.error("Error cargando usuario:", error);
        window.location.href = "Visitas.html";
    }
});
