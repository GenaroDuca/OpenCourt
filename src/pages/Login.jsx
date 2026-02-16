import { useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(error);
      toast.error("Credenciales incorrectas");
    } else {
      toast.success("¡Inicio de sesión exitoso!");
      navigate("/admin-panel");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-background-card-color border border-border-color rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold font-display mb-2 text-white">
              Bienvenido
            </h1>
            <p className="text-gray-400 text-center text-sm">
              Ingresa tus credenciales para acceder al panel de administración
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                className="text-gray-300 text-sm font-medium ml-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-border-color rounded-lg px-4 py-3  placeholder-gray-600 focus:outline-none transition-all duration-200 text-text-color"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-gray-300 text-sm font-medium ml-1"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-border-color rounded-lg px-4 py-3  placeholder-gray-600 focus:outline-none transition-all duration-200 text-text-color"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-secondary-green text-black font-bold py-3.5 rounded-lg hover:bg-secondary-green-hover active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(19,236,91,0.2)] hover:shadow-[0_0_30px_rgba(19,236,91,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} OpenCourt. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
