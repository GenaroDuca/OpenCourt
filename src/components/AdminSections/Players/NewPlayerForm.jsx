import React from "react";
import { useState } from "react";
import { BsPerson, BsTelephone, BsX, BsCheckLg } from "react-icons/bs";
import { IoIosPodium } from "react-icons/io";

import toast from "react-hot-toast";

import { createPlayer } from "../../../services/playerService";

export default function NewPlayerForm({ isOpen, onClose }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPhone(value);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const isFormValid = fullName.trim() !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormValid) {
      setLoading(true);
      try {
        await createPlayer({
          full_name: fullName,
          phone,
          is_student: isStudent,
          category,
        });
        toast.success("¡Jugador agregado exitosamente!");
      } catch (error) {
        console.error(error);
        toast.error("Error al agregar el jugador");
      } finally {
        setFullName("");
        setPhone("");
        setIsStudent(false);
        setLoading(false);
        onClose();
        window.location.reload();
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop with blur */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`relative w-full max-w-md h-full bg-background-card-color shadow-2xl transition-transform duration-300 transform flex flex-col border-l border-white/5 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-6 border-b border-border-color bg-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white">Nuevo Jugador</h2>
            <p className="text-sm text-text-color/60">
              Ingresa los datos del nuevo jugador
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border  cursor-pointer transition-all duration-300 text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
          >
            <BsX size={24} />
          </button>
        </div>

        {/* Content */}
        <form
          action=""
          onSubmit={handleSubmit}
          className="h-full flex flex-col"
        >
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3 text-primary mb-2">
                <span className="h-px flex-1 bg-border-color"></span>
                <span className="uppercase text-xs font-bold tracking-widest text-text-color-green">
                  Información Personal
                </span>
                <span className="h-px flex-1 bg-border-color"></span>
              </div>

              {/* Name Input */}
              <div className="flex flex-col gap-2 group">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-text-color transition-colors"
                >
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-color/50 transition-colors">
                    <BsPerson size={18} />
                  </div>
                  <input
                    type="text"
                    id="name"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background-color border border-border-color text-text-color placeholder-text-color/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-300"
                    placeholder="Ej. Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="flex flex-col gap-2 group">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-text-color transition-colors"
                >
                  Teléfono (Opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-color/50 transition-colors">
                    <BsTelephone size={18} />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background-color border border-border-color text-text-color placeholder-text-color/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-300"
                    placeholder="Ej. 2284 567890"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>

              {/* Category Input */}
              <div className="flex flex-col gap-2 group">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-text-color transition-colors"
                >
                  Categoría (Opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-color/50 transition-colors">
                    <IoIosPodium size={18} />
                  </div>
                  <input
                    type="text"
                    id="category"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background-color border border-border-color text-text-color placeholder-text-color/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-300"
                    placeholder="Ej. Dama A"
                    value={category}
                    onChange={handleCategoryChange}
                  />
                </div>
              </div>

              {/* Is Student Checkbox */}
              <div
                className="flex items-center justify-center gap-3 group cursor-pointer "
                onClick={() => setIsStudent(!isStudent)}
              >
                <div
                  className={`w-5 h-5 border flex items-center justify-center transition-all duration-300 rounded-full ${
                    isStudent
                      ? "bg-primary border-primary"
                      : "border-text-color/50 group-hover:border-primary"
                  }`}
                >
                  {isStudent && <BsCheckLg size={14} className="text-white" />}
                </div>
                <label className="text-sm font-medium text-text-color cursor-pointer select-none group-hover:text-primary transition-colors">
                  ¿Es Alumno?
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border-color bg-white/5 flex gap-4">
            <button
              onClick={onClose}
              className="gap-3 px-4 py-3 rounded-xl border  cursor-pointer transition-all duration-300 text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/15 w-full"
            >
              Cancelar
            </button>
            <button
              disabled={!isFormValid || loading}
              className={`gap-3 px-4 py-3 rounded-xl border transition-all duration-300 w-full font-bold flex items-center justify-center
                ${
                  isFormValid && !loading
                    ? "bg-primary/10 text-primary hover:bg-primary/15 border-primary/20 cursor-pointer"
                    : "bg-text-color/10 text-text-color/50 border-text-color/10 cursor-not-allowed opacity-50"
                }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              ) : (
                "Guardar Jugador"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
