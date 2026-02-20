import React from "react";
import { useState, useEffect } from "react";
import {
  BsPerson,
  BsTelephone,
  BsX,
  BsCheckLg,
  BsChevronDown,
  BsTrash,
} from "react-icons/bs";
import { IoIosPodium } from "react-icons/io";

import toast from "react-hot-toast";

import {
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "../../../services/playerService";

export default function NewPlayerForm({
  isOpen,
  onClose,
  onPlayerAdded,
  playerToEdit,
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Sin Categoría");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    if (isOpen && playerToEdit) {
      setFullName(playerToEdit.full_name || "");
      setPhone(playerToEdit.phone || "");
      setCategory(playerToEdit.category || "Sin Categoría");
      setIsStudent(playerToEdit.is_student || false);
    } else if (isOpen && !playerToEdit) {
      // Reset for new player
      setFullName("");
      setPhone("");
      setCategory("Sin Categoría");
      setIsStudent(false);
    }
  }, [isOpen, playerToEdit]);

  const CATEGORIES = [
    "Sin Categoría",
    "Damas A",
    "Dama B",
    "Dama C",
    "Dama D",
    "Principiante",
    "Caballero 1ra",
    "Caballero 2da",
    "Caballero Intermedia",
    "Caballero 3ra",
    "Caballero 4ta",
    "Caballero 5ta",
    "Caballero 6ta",
  ];
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        const playerData = {
          full_name: fullName,
          phone,
          is_student: isStudent,
          category,
        };

        if (playerToEdit) {
          await updatePlayer(playerToEdit.id, playerData);
          toast.success("¡Jugador actualizado exitosamente!");
        } else {
          await createPlayer(playerData);
          toast.success("¡Jugador agregado exitosamente!");
        }
      } catch (error) {
        console.error(error);
        toast.error(
          playerToEdit
            ? "Error al actualizar el jugador"
            : "Error al agregar el jugador",
        );
      } finally {
        setLoading(false);
        if (onPlayerAdded) {
          onPlayerAdded();
        }
        onClose(); // Close strictly after operation
      }
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!playerToEdit) return;

    setLoading(true);
    try {
      await deletePlayer(playerToEdit.id);
      toast.success("Jugador eliminado exitosamente");
      if (onPlayerAdded) {
        onPlayerAdded(); // Reload list
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar el jugador");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
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
        <div className="flex justify-between items-center md:p-4 p-2 border-b border-border-color bg-white/5">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-white">
              {playerToEdit ? "Editar Jugador" : "Nuevo Jugador"}
            </h2>
            <p className="text-xs md:text-sm text-text-color/60">
              {playerToEdit
                ? "Modifica los datos del jugador"
                : "Ingresa los datos del nuevo jugador"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="md:p-2 p-0.5 rounded-2xl md:rounded-lg border cursor-pointer transition-all duration-300 text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
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
          <div className="flex-1 overflow-y-auto md:px-4 px-2 mt-4">
            <div className=" flex flex-col gap-4">
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
                    className="w-full pl-11 pr-4 py-2 rounded-2xl md:rounded-lg bg-background-color text-text-color placeholder-text-color/30 focus:outline-none focus:border-primary/30 transition-all duration-300 border border-border-color hover:border-primary/30"
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
                    className="w-full pl-11 pr-4 py-2 rounded-2xl md:rounded-lg bg-background-color text-text-color placeholder-text-color/30 focus:outline-none focus:border-primary/30 transition-all duration-300 border border-border-color hover:border-primary/30"
                    placeholder="Ej. 2284 567890"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="flex flex-col gap-2 group relative">
                <label className="text-sm font-medium text-text-color transition-colors">
                  Categoría (Opcional)
                </label>
                <div className="relative">
                  {/* Trigger */}
                  <div
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={`w-full pl-4 pr-4 py-2 rounded-2xl md:rounded-lg bg-background-color border text-text-color cursor-pointer flex items-center justify-between transition-all duration-300 ${
                      isCategoryOpen
                        ? "border-primary/30"
                        : "border-border-color hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-text-color/50">
                      <IoIosPodium size={18} />
                      <span
                        className={
                          category ? "text-text-color" : "text-text-color/50"
                        }
                      >
                        {category || "Seleccionar categoría"}
                      </span>
                    </div>

                    <BsChevronDown
                      className={`text-text-color/50 transition-transform duration-300 ${isCategoryOpen ? "rotate-180" : ""}`}
                    />
                  </div>

                  {/* Options List */}
                  <div
                    className={`absolute z-20 top-full left-0 right-0 mt-2 bg-background-card-color border border-border-color rounded-2xl md:rounded-lg overflow-hidden shadow-xl transition-all duration-300 origin-top ${
                      isCategoryOpen
                        ? "opacity-100 translate-y-0 scale-100 visible"
                        : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
                    }`}
                  >
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 md:p-4 flex flex-col gap-2">
                      {CATEGORIES.map((cat) => (
                        <div
                          key={cat}
                          onClick={() => {
                            setCategory(cat);
                            setIsCategoryOpen(false);
                          }}
                          className={`p-2 rounded-2xl  md:rounded-lg cursor-pointer text-sm transition-colors flex items-center justify-between  ${
                            category === cat
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-text-color hover:bg-white/5"
                          }`}
                        >
                          {cat}
                          {category === cat && <BsCheckLg size={14} />}
                        </div>
                      ))}
                    </div>
                  </div>
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
          <div className="p-2 md:p-4 border-t border-border-color bg-white/5 flex gap-2 md:gap-4 ">
            <button
              type="button"
              onClick={onClose}
              className="md:h-[50px] w-full  flex items-center justify-center md:px-4 md:py-3 p-2 gap-3 rounded-lg border cursor-pointer transition-all duration-300 flex-col md:flex-row text-sm  text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/15 w-full"
            >
              Cancelar
            </button>
            <button
              disabled={!isFormValid || loading}
              className={`md:h-[50px] w-full  flex items-center justify-center md:px-4 md:py-3 p-2 gap-3 rounded-lg border cursor-pointer transition-all duration-300 flex-col md:flex-row text-sm 
                ${
                  isFormValid && !loading
                    ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30 cursor-pointer"
                    : "bg-text-color/10 text-text-color/50 border-text-color/10 cursor-not-allowed opacity-50"
                }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              ) : (
                "Guardar"
              )}
            </button>
            {playerToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="gap-2 px-4 py-3 rounded-lg border border-red-500/20 text-red-500 bg-red-500/10 hover:bg-red-500/15 cursor-pointer transition-all duration-300 font-medium flex items-center justify-center text-sm"
              >
                <BsTrash size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-background-card-color border border-white/10 md:p-6 p-2 rounded-lg shadow-2xl max-w-sm w-full flex flex-col gap-2 md:gap-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white text-center">
              ¿Eliminar Jugador?
            </h3>
            <p className="text-text-color/70 text-center text-sm">
              Esta acción eliminará al jugador{" "}
              <span className="text-white font-bold">
                {playerToEdit?.full_name}
              </span>{" "}
              y todo su historial. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="md:h-[50px] w-full  flex items-center justify-center md:px-4 md:py-3 p-2 gap-3 rounded-lg border transition-all duration-300 flex-col md:flex-row text-sm  bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="md:h-[50px] w-full  flex items-center justify-center md:px-4 md:py-3 p-2 gap-3 rounded-lg border transition-all duration-300 flex-col md:flex-row text-sm  bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 cursor-pointer"
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
