import React, { useState, useEffect, useRef } from "react";
import {
  BsX,
  BsPerson,
  BsClock,
  BsPlus,
  BsTrash,
  BsChevronDown,
  BsSearch,
  BsCheckLg,
  BsCalendar3,
} from "react-icons/bs";
import {
  createBooking,
  updateBooking,
  deleteBooking,
} from "../../../services/bookingService";
import toast from "react-hot-toast";

// Generate 30 min slots for the dropdown
const GENERATE_TIME_OPTIONS = () => {
  const slots = [];
  for (let i = 8; i < 23; i++) {
    slots.push(`${i.toString().padStart(2, "0")}:00`);
    slots.push(`${i.toString().padStart(2, "0")}:30`);
  }
  return slots;
};

const TIME_OPTIONS = GENERATE_TIME_OPTIONS();
const DURATION_MINUTES = 90;

export default function NewBookingModal({
  isOpen,
  onClose,
  onBookingAdded,
  courts,
  priceConfig,
  players,
  initialDate,
  initialCourtId,
  initialTime,
  bookings = [],
  bookingToEdit = null, // Prop for editing
}) {
  const [courtId, setCourtId] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [startTime, setStartTime] = useState("09:00");

  // Custom Select States
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");

  // Multiple players state
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const timeDropdownRef = useRef(null);
  const playerDropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (bookingToEdit) {
        // EDIT MODE: Pre-fill data
        const start = new Date(bookingToEdit.start_time);

        // Date
        const year = start.getFullYear();
        const month = String(start.getMonth() + 1).padStart(2, "0");
        const day = String(start.getDate()).padStart(2, "0");
        setDateStr(`${year}-${month}-${day}`);

        // Time
        const hours = String(start.getHours()).padStart(2, "0");
        const minutes = String(start.getMinutes()).padStart(2, "0");
        setStartTime(`${hours}:${minutes}`);

        // Court
        setCourtId(bookingToEdit.court_id);

        // Players
        // Map booking_players to selectedPlayers format
        const mappedPlayers = bookingToEdit.booking_players.map((bp) => ({
          id: bp.players.id,
          full_name: bp.players.full_name,
          is_student: bp.players.is_student,
          price: bp.individual_price,
          is_paid: bp.is_paid, // Include payment status
        }));
        setSelectedPlayers(mappedPlayers);
      } else {
        // CREATE MODE: Defaults
        const targetDate = initialDate || new Date();
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, "0");
        const day = String(targetDate.getDate()).padStart(2, "0");
        const targetDateStr = `${year}-${month}-${day}`;
        setDateStr(targetDateStr);

        const targetStartTime = initialTime || "09:00";
        setStartTime(targetStartTime);

        if (initialCourtId) {
          setCourtId(initialCourtId);
        } else {
          // Find first available court logic (same as before)
          const proposedStart = new Date(`${targetDateStr}T${targetStartTime}`);
          const proposedEnd = new Date(
            proposedStart.getTime() + DURATION_MINUTES * 60000,
          );

          const availableCourt = courts.find((court) => {
            const isOccupied = bookings.some((b) => {
              if (b.court_id !== court.id) return false;
              const bStart = new Date(b.start_time);
              const bEnd = new Date(b.end_time);
              return bStart < proposedEnd && bEnd > proposedStart;
            });
            return !isOccupied;
          });

          setCourtId(availableCourt ? availableCourt.id : "");
        }

        setSelectedPlayers([]);
      }

      setPlayerSearch("");
      setIsTimeOpen(false);
      setIsPlayerOpen(false);
    }
  }, [
    isOpen,
    initialDate,
    initialCourtId,
    initialTime,
    courts,
    bookingToEdit,
    bookings,
  ]);

  // Reset confirmation state when modal opens/closes
  useEffect(() => {
    if (!isOpen) setShowDeleteConfirm(false);
  }, [isOpen]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(event.target)
      ) {
        setIsTimeOpen(false);
      }
      if (
        playerDropdownRef.current &&
        !playerDropdownRef.current.contains(event.target)
      ) {
        setIsPlayerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddPlayer = (player) => {
    if (selectedPlayers.find((p) => p.id === player.id)) {
      toast.error("Jugador ya agregado");
      return;
    }

    if (priceConfig) {
      const price = player.is_student
        ? Number(priceConfig.student_price)
        : Number(priceConfig.visitor_price);
      setSelectedPlayers([
        ...selectedPlayers,
        { ...player, price, is_paid: false },
      ]);
      setIsPlayerOpen(false);
      setPlayerSearch("");
    }
  };

  const handleRemovePlayer = (id) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== id));
  };

  const handleTogglePaid = (id) => {
    setSelectedPlayers(
      selectedPlayers.map((p) =>
        p.id === id ? { ...p, is_paid: !p.is_paid } : p,
      ),
    );
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!bookingToEdit) return;

    setLoading(true);
    try {
      await deleteBooking(bookingToEdit.id);
      toast.success("Reserva eliminada");
      onBookingAdded(); // Reload
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al eliminar");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const isCourtOccupied = (targetCourtId) => {
    if (!dateStr || !startTime) return false;

    const proposedStart = new Date(`${dateStr}T${startTime}`);
    const proposedEnd = new Date(
      proposedStart.getTime() + DURATION_MINUTES * 60000,
    );

    return bookings.some((b) => {
      // Exclude current booking if we are editing it
      if (bookingToEdit && b.id === bookingToEdit.id) return false;

      if (b.court_id !== targetCourtId) return false;
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      return bStart < proposedEnd && bEnd > proposedStart;
    });
  };

  const calculateEndTime = (start) => {
    const [hours, minutes] = start.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes + DURATION_MINUTES);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const totalPrice = selectedPlayers.reduce((sum, p) => sum + p.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courtId || selectedPlayers.length === 0) {
      toast.error("Selecciona una cancha y al menos un jugador");
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(`${dateStr}T${startTime}`);
      const endDateTime = new Date(
        startDateTime.getTime() + DURATION_MINUTES * 60000,
      );

      const payload = {
        court_id: courtId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        players: selectedPlayers.map((p) => ({
          id: p.id,
          price: p.price,
          is_paid: p.is_paid, // Pass payment status
        })),
      };

      if (bookingToEdit) {
        await updateBooking(bookingToEdit.id, payload);
        toast.success("Reserva actualizada exitosamente");
      } else {
        await createBooking(payload);
        toast.success("Reserva creada exitosamente");
      }

      onBookingAdded();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al guardar la reserva");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((p) =>
    p.full_name.toLowerCase().includes(playerSearch.toLowerCase()),
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md h-full bg-background-card-color shadow-2xl transition-transform duration-300 transform flex flex-col border-l border-white/5 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center md:p-4 p-2 border-b border-border-color bg-white/5">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-white">
              {bookingToEdit ? "Editar Reserva" : "Nueva Reserva"}
            </h2>
            <div className="flex items-center gap-2 text-text-color/60 text-xs md:text-sm mt-1">
              <BsCalendar3 />
              <span>
                {dateStr &&
                  new Date(`${dateStr}T00:00:00`).toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:p-2 p-0.5 rounded-lg border cursor-pointer transition-all duration-300 text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
          >
            <BsX size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto md:px-4 px-2 mt-4 custom-scrollbar ">
            <div className="flex flex-col gap-4">
              {/* Separators */}
              <div className="flex items-center gap-3 text-primary">
                <span className="h-px flex-1 bg-border-color"></span>
                <span className="uppercase text-xs font-bold tracking-widest text-text-color-green">
                  Detalles del Turno
                </span>
                <span className="h-px flex-1 bg-border-color"></span>
              </div>

              {/* Court Selection */}
              <div className="flex flex-col gap-2 ">
                <div className="grid grid-cols-3 gap-2">
                  {courts.map((court) => {
                    const occupied = isCourtOccupied(court.id);
                    return (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => !occupied && setCourtId(court.id)}
                        disabled={occupied}
                        className={`py-3 text-sm font-bold rounded-lg transition-all border duration-300 flex flex-col items-center justify-center ${
                          courtId === court.id
                            ? "bg-primary text-black border-primary scale-105 shadow-lg shadow-primary/20"
                            : occupied
                              ? "bg-gray-500/10 text-gray-500/50 border-gray-500/10 cursor-not-allowed opacity-70"
                              : "bg-background-color text-text-color/60 border-border-color hover:border-primary/50 cursor-pointer hover:bg-white/5"
                        }`}
                      >
                        {court.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection (Custom Dropdown) */}
              <div
                className="flex flex-col gap-2 relative z-30"
                ref={timeDropdownRef}
              >
                <label className="text-sm font-medium text-text-color">
                  Horario Inicio
                </label>
                <div
                  onClick={() => setIsTimeOpen(!isTimeOpen)}
                  className={`w-full pl-4 pr-4 py-2 rounded-lg bg-background-color border text-text-color cursor-pointer flex items-center justify-between transition-all duration-300 ${
                    isTimeOpen
                      ? "border-primary ring-1 ring-primary/50"
                      : "border-border-color hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BsClock className="text-text-color/50" />
                    <span>{startTime}</span>
                  </div>
                  <BsChevronDown
                    className={`text-text-color/50 transition-transform duration-300 ${isTimeOpen ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Dropdown Options */}
                <div
                  className={`absolute z-20 top-full left-0 right-0 mt-2 bg-background-card-color border border-border-color rounded-lg overflow-hidden shadow-xl transition-all duration-300 origin-top ${
                    isTimeOpen
                      ? "opacity-100 translate-y-0 scale-100 visible"
                      : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
                  }`}
                >
                  <div className="max-h-60 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
                    {TIME_OPTIONS.map((time) => (
                      <div
                        key={time}
                        onClick={() => {
                          setStartTime(time);
                          setIsTimeOpen(false);
                        }}
                        className={`px-4 py-2.5 rounded-lg cursor-pointer text-sm transition-colors flex items-center justify-between ${
                          startTime === time
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-text-color hover:bg-white/5"
                        }`}
                      >
                        {time}
                        {startTime === time && <BsCheckLg size={14} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Players Section */}
              <div className="flex items-center gap-3 text-primary">
                <span className="h-px flex-1 bg-border-color"></span>
                <span className="uppercase text-xs font-bold tracking-widest text-text-color-green">
                  Jugadores
                </span>
                <span className="h-px flex-1 bg-border-color"></span>
              </div>

              {/* Player Selector (Custom Dropdown) */}
              <div
                className="flex flex-col gap-2 relative z-20"
                ref={playerDropdownRef}
              >
                <label className="text-sm font-medium text-text-color">
                  Agregar Jugador
                </label>
                <div
                  onClick={() => setIsPlayerOpen(!isPlayerOpen)}
                  className={`w-full pl-4 pr-4 py-2 rounded-lg bg-background-color border text-text-color cursor-pointer flex items-center justify-between transition-all duration-300 ${
                    isPlayerOpen
                      ? "border-primary ring-1 ring-primary/50"
                      : "border-border-color hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3 text-text-color/50">
                    <BsPerson size={18} />
                    <span className="text-text-color">
                      Seleccionar jugador...
                    </span>
                  </div>
                  <BsPlus size={24} className="text-primary" />
                </div>

                {/* Dropdown Options */}
                <div
                  className={`absolute z-20 top-full left-0 right-0 mt-2 bg-background-card-color border border-border-color rounded-lg overflow-hidden shadow-xl transition-all duration-300 origin-top ${
                    isPlayerOpen
                      ? "opacity-100 translate-y-0 scale-100 visible"
                      : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
                  }`}
                >
                  {/* Search Input inside Dropdown */}
                  <div className="p-2 border-b border-border-color">
                    <div className="flex items-center bg-background-color rounded-lg px-3 py-2 border border-border-color">
                      <BsSearch className="text-text-color/50 mr-2" />
                      <input
                        type="text"
                        placeholder="Buscar jugador..."
                        className="bg-transparent border-none outline-none text-text-color text-sm w-full placeholder-text-color/30"
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player) => {
                        const isSelected = selectedPlayers.some(
                          (p) => p.id === player.id,
                        );
                        return (
                          <div
                            key={player.id}
                            onClick={() =>
                              !isSelected && handleAddPlayer(player)
                            }
                            className={`px-4 py-2.5 rounded-lg cursor-pointer text-sm transition-colors flex items-center justify-between ${
                              isSelected
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-text-color hover:bg-white/5"
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {player.full_name}
                              </span>
                              <span className="text-xs text-text-color/50">
                                {player.is_student ? "Alumno" : "Visitante"}
                              </span>
                            </div>
                            {isSelected ? (
                              <BsCheckLg size={16} className="text-primary" />
                            ) : null}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-text-color/50 text-sm">
                        No se encontraron jugadores
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Players List */}
              <div className="grid grid-cols-1 gap-2">
                {selectedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex justify-between items-center bg-background-color p-3 rounded-lg border border-border-color group"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-bold text-text-color">
                          {player.full_name}
                        </p>
                        <p className="text-xs text-text-color/50">
                          {player.is_student ? "Alumno" : "Visitante"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePaid(player.id)}
                        className={`text-[10px] md:text-md font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          player.is_paid
                            ? "bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20"
                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/20"
                        }`}
                      >
                        {player.is_paid ? "PAGADO" : "PENDIENTE"}
                      </button>

                      <span className="text-sm font-bold text-primary">
                        ${player.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(player.id)}
                        className="text-text-color/30 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      >
                        <BsTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border-color bg-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-text-color/60">
                  Total a pagar
                </span>
                <span className="text-2xl font-bold text-white">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-right flex items-center gap-2">
                <span className="text-sm text-text-color/60">Finaliza</span>
                <span className="text-sm font-bold text-primary">
                  {calculateEndTime(startTime)}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="gap-3 px-4 py-3 rounded-lg border  cursor-pointer transition-all duration-300 text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/15 w-full"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || selectedPlayers.length === 0}
                className={`gap-3 px-4 py-3 rounded-lg border transition-all duration-300 w-full font-bold flex items-center justify-center
                  ${
                    !loading && selectedPlayers.length > 0
                      ? "bg-primary/10 text-primary hover:bg-primary/15 border-primary/20 cursor-pointer"
                      : "bg-text-color/10 text-text-color/50 border-text-color/10 cursor-not-allowed opacity-50"
                  }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : (
                  "Guardar"
                )}
              </button>
              {bookingToEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="gap-2 px-4 py-3 rounded-lg border border-red-500/20 text-red-500 bg-red-500/10 hover:bg-red-500/15 cursor-pointer transition-all duration-300 font-medium flex items-center justify-center"
                >
                  <BsTrash />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-background-card-color border border-white/10 p-6 rounded-lg shadow-2xl max-w-sm w-full flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white text-center">
              ¿Eliminar Reserva?
            </h3>
            <p className="text-text-color/70 text-center text-sm">
              Esta acción no se puede deshacer. ¿Estás seguro de que deseas
              continuar?
            </p>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-lg border transition-colors font-medium text-sm bg-primary/10 text-primary hover:bg-primary/15 border-primary/20 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors font-bold text-sm"
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
