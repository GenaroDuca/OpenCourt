# OpenCourt

OpenCourt es una aplicación completa diseñada para facilitar la administración de turnos en de tenis. El sistema permite gestionar la disponibilidad de las canchas, realizar reservas de forma digital y administrar los perfiles de los usuarios desde una interfaz sencilla y eficiente.

## 🚀 Características principales

- **Gestión de Turnos:** Visualización de disponibilidad y reserva de horarios en tiempo real.
- **Autenticación Segura:** Manejo de perfiles de usuario y administradores mediante Supabase Auth.
- **Base de Datos Relacional:** Estructura robusta para evitar solapamientos de turnos y gestionar la disponibilidad por tipo de superficie (Polvo de ladrillo, cemento, etc.).
- **Interfaz Adaptativa:** Diseño moderno y responsivo optimizado para desktop y dispositivos móviles.

## 🛠️ Stack Tecnológico

- **Frontend:** [React](https://reactjs.org/) con [Vite](https://vitejs.dev/).
- **Enrutado:** [React Router](https://reactrouter.com/).
- **Backend & DB:** [Supabase](https://supabase.com/) (PostgreSQL).
- **Estilos:** [CSS Modules / Tailwind]

## 📦 Instalación y Configuración

1.  **Clonar el repositorio:**

    ```bash
    git clone [https://github.com/tu-usuario/opencourt.git](https://github.com/tu-usuario/opencourt.git)
    cd opencourt
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales de Supabase:

    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_anon_key
    ```

4.  **Iniciar el entorno de desarrollo:**
    ```bash
    npm run dev
    ```

---

Desarrollado por **Genaro Duca** – Full Stack Developer.
