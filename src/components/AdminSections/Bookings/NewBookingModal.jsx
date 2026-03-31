import React, { useState, useEffect, useRef } from "react";
import { normalizeText } from "../../../utils/textUtils";
import {
  createBooking,
  updateBooking,
  deleteBooking,
  deleteBookingSeries,
} from "../../../services/bookingService";
import {
  createBlockout,
  updateBlockout,
  deleteBlockout,
  createBlockoutException,
} from "../../../services/blockoutService";
import { createPlayer } from "../../../services/playerService";
import toast from "react-hot-toast";
import {
  BsX,
  BsClock,
  BsChevronDown,
  BsCheckLg,
  BsPerson,
  BsPlus,
  BsSearch,
  BsTrash,
} from "react-icons/bs";
import { Link } from "react-router-dom";

const getAvatarColor = (name) => {
  const colors = [
    "bg-red-200 text-red-800",
    "bg-orange-200 text-orange-800",
    "bg-amber-200 text-amber-800",
    "bg-yellow-200 text-yellow-800",
    "bg-lime-200 text-lime-800",
    "bg-green-200 text-green-800",
    "bg-emerald-200 text-emerald-800",
    "bg-teal-200 text-teal-800",
    "bg-cyan-200 text-cyan-800",
    "bg-sky-200 text-sky-800",
    "bg-blue-200 text-blue-800",
    "bg-indigo-200 text-indigo-800",
    "bg-violet-200 text-violet-800",
    "bg-purple-200 text-purple-800",
    "bg-fuchsia-200 text-fuchsia-800",
    "bg-pink-200 text-pink-800",
    "bg-rose-200 text-rose-800",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getInitials = (name) => {
  if (!name) return "";
  const names = name.trim().split(/\s+/);
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

// Generate 30 min slots for the dropdown
const GENERATE_TIME_OPTIONS = () => {
  const slots = [];
  for (let i = 8; i < 24; i++) {
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
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:30");

  // Custom Select States
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");

  // Multiple players state
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [isQuickAddStudent, setIsQuickAddStudent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Payment Selection State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlayerForPayment, setSelectedPlayerForPayment] =
    useState(null);

  // Manual Price Mode State
  const [manualPriceMode, setManualPriceMode] = useState(false);

  // Fixed Booking State
  const [isFixed, setIsFixed] = useState(false);

  // Class State
  const [isClass, setIsClass] = useState(false);
  const [classReason, setClassReason] = useState("");

  const [details, setDetails] = useState(""); // Details for notes

  const timeDropdownRef = useRef(null);
  const endTimeDropdownRef = useRef(null);
  const playerDropdownRef = useRef(null);

  const handleUpdatePlayerPrice = (id, newPrice) => {
    setSelectedPlayers(
      selectedPlayers.map((p) => (p.id === id ? { ...p, price: newPrice } : p)),
    );
  };

  useEffect(() => {
    if (isOpen) {
      if (bookingToEdit) {
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

        const end = new Date(bookingToEdit.end_time);
        const endHours = String(end.getHours()).padStart(2, "0");
        const endMinutes = String(end.getMinutes()).padStart(2, "0");
        setEndTime(`${endHours}:${endMinutes}`);

        // Court
        setCourtId(bookingToEdit.court_id);

        if (bookingToEdit.is_blockout) {
          setIsClass(true);
          setClassReason(bookingToEdit.details || "");
          setIsFixed(bookingToEdit.is_fixed || false);
          setSelectedPlayers([]);
          setDetails("");
        } else {
          setIsClass(false);
          setClassReason("");
          setDetails(bookingToEdit.details || "");

          if (
            bookingToEdit.booking_players &&
            bookingToEdit.booking_players.length > 0
          ) {
            const mappedPlayers = bookingToEdit.booking_players.map((bp) => ({
              id: bp.players.id,
              full_name: bp.players.full_name,
              is_student: bp.players.is_student,
              price: bp.individual_price,
              is_paid: bp.is_paid,
              payment_method:
                bp.payments && bp.payments.length > 0
                  ? bp.payments[0].payment_method
                  : null,
            }));
            setSelectedPlayers(mappedPlayers);
            setIsFixed(bookingToEdit.is_fixed || false);
          } else {
            setSelectedPlayers([]);
            setIsFixed(false);
          }
        }
      } else {
        // CREATE MODE: Defaults
        const targetDate = initialDate || new Date();
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, "0");
        const day = String(targetDate.getDate()).padStart(2, "0");
        const targetDateStr = `${year}-${month}-${day}`;
        setDateStr(targetDateStr);

        let targetStartTime = initialTime || "08:00";
        setStartTime(targetStartTime);

        const [h, m] = targetStartTime.split(":").map(Number);
        const defaultEnd = new Date();
        defaultEnd.setHours(h, m + DURATION_MINUTES);
        setEndTime(
          defaultEnd.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        );

        if (initialCourtId) {
          setCourtId(initialCourtId);
        } else {
          // ... (existing court finding logic)
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
        setIsFixed(false);
        setIsClass(false);
        setClassReason("");
        setDetails("");
      }

      setPlayerSearch("");
      setIsTimeOpen(false);
      setIsEndTimeOpen(false);
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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      setShowPaymentModal(false);
      setSelectedPlayerForPayment(null);
    }
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
        endTimeDropdownRef.current &&
        !endTimeDropdownRef.current.contains(event.target)
      ) {
        setIsEndTimeOpen(false);
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

  const handleQuickAddPlayer = async () => {
    try {
      setLoading(true);
      const newPlayer = await createPlayer({
        full_name: playerSearch,
        is_student: isQuickAddStudent,
        phone: null,
      });
      toast.success("Jugador creado y agregado");
      handleAddPlayer(newPlayer); // Adds to selectedPlayers
      setPlayerSearch("");
      setIsQuickAddStudent(false); // Reset
    } catch (error) {
      console.error(error);
      toast.error("Error al crear jugador");
    } finally {
      setLoading(false);
    }
  };

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

  const handleTogglePaid = (player) => {
    if (player.is_paid) {
      // Mark as pending (remove payment info)
      setSelectedPlayers(
        selectedPlayers.map((p) =>
          p.id === player.id
            ? { ...p, is_paid: false, payment_method: null }
            : p,
        ),
      );
    } else {
      // Open payment modal
      setSelectedPlayerForPayment(player);
      setShowPaymentModal(true);
    }
  };

  const confirmPayment = (method) => {
    if (selectedPlayerForPayment) {
      setSelectedPlayers(
        selectedPlayers.map((p) =>
          p.id === selectedPlayerForPayment.id
            ? { ...p, is_paid: true, payment_method: method }
            : p,
        ),
      );
      setShowPaymentModal(false);
      setSelectedPlayerForPayment(null);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const isCourtOccupied = (targetCourtId) => {
    if (!dateStr || !startTime) return false;

    const proposedStart = new Date(`${dateStr}T${startTime}`);
    const proposedEnd = endTime
      ? new Date(`${dateStr}T${endTime}`)
      : new Date(proposedStart.getTime() + DURATION_MINUTES * 60000);

    return bookings.some((b) => {
      // Exclude current booking if we are editing it
      if (bookingToEdit && b.id === bookingToEdit.id) return false;

      if (b.court_id !== targetCourtId) return false;
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      return bStart < proposedEnd && bEnd > proposedStart;
    });
  };

  // Ensure selected court is valid when schedule changes
  useEffect(() => {
    if (
      !isOpen ||
      !dateStr ||
      !startTime ||
      !endTime ||
      !courts ||
      courts.length === 0
    )
      return;

    // Check if the current schedule matches the original one (if editing)
    const isOriginalSchedule =
      bookingToEdit &&
      courtId === bookingToEdit.court_id &&
      new Date(bookingToEdit.start_time).toISOString().split("T")[0] ===
        dateStr &&
      (!isClass ||
        (`${String(new Date(bookingToEdit.start_time).getHours()).padStart(2, "0")}:${String(new Date(bookingToEdit.start_time).getMinutes()).padStart(2, "0")}` ===
          startTime &&
          `${String(new Date(bookingToEdit.end_time).getHours()).padStart(2, "0")}:${String(new Date(bookingToEdit.end_time).getMinutes()).padStart(2, "0")}` ===
            endTime));

    // If it's the original schedule, we don't need to auto-find a new court
    if (isOriginalSchedule) return;

    if (courtId && !isCourtOccupied(courtId)) {
      return;
    }

    const availableCourt = courts.find((c) => !isCourtOccupied(c.id));
    if (availableCourt) {
      if (courtId !== availableCourt.id) {
        setCourtId(availableCourt.id);
      }
    } else {
      if (courtId !== "") {
        setCourtId("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr, startTime, endTime, isClass, bookings, courts, isOpen]);

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

  const confirmDelete = async (scope = "single") => {
    if (!bookingToEdit) return;

    setLoading(true);
    try {
      if (bookingToEdit.is_blockout) {
        if (scope === "single" && isFixed) {
          await createBlockoutException(
            bookingToEdit.id,
            bookingToEdit.court_id,
            bookingToEdit.start_time,
            bookingToEdit.end_time,
          );
          toast.success("Clase eliminada para este día");
        } else {
          await deleteBlockout(bookingToEdit.id);
          toast.success(
            scope === "series"
              ? "Serie de clases eliminada"
              : "Clase eliminada",
          );
        }
      } else {
        if (scope === "series") {
          await deleteBookingSeries(bookingToEdit);
          toast.success("Serie de reservas eliminada");
        } else {
          await deleteBooking(bookingToEdit.id);
          toast.success("Reserva eliminada");
        }
      }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const scheduleChanged =
      !bookingToEdit ||
      courtId !== bookingToEdit.court_id ||
      new Date(bookingToEdit.start_time).toISOString().split("T")[0] !==
        dateStr ||
      `${String(new Date(bookingToEdit.start_time).getHours()).padStart(2, "0")}:${String(new Date(bookingToEdit.start_time).getMinutes()).padStart(2, "0")}` !==
        startTime ||
      (isClass &&
        `${String(new Date(bookingToEdit.end_time).getHours()).padStart(2, "0")}:${String(new Date(bookingToEdit.end_time).getMinutes()).padStart(2, "0")}` !==
          endTime);

    if (!courtId) {
      toast.error("Selecciona una cancha");
      return;
    }

    if (scheduleChanged && isCourtOccupied(courtId)) {
      toast.error("La cancha seleccionada no está disponible en este horario");
      return;
    }
    if (isClass && endTime <= startTime) {
      toast.error("El horario de fin debe ser mayor al horario de inicio");
      return;
    }
    if (isClass && !classReason.trim()) {
      toast.error("Debes ingresar el nombre de la clase");
      return;
    }
    if (!isClass && selectedPlayers.length === 0) {
      toast.error("Selecciona al menos un jugador");
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(`${dateStr}T${startTime}`);
      const endDateTime = endTime
        ? new Date(`${dateStr}T${endTime}`)
        : new Date(startDateTime.getTime() + DURATION_MINUTES * 60000);

      if (isClass) {
        const payload = {
          court_id: courtId,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          reason: classReason,
          is_recurring: isFixed,
          day_of_week: startDateTime.getDay(), // Adding day from start time
        };

        if (bookingToEdit && bookingToEdit.is_blockout) {
          await updateBlockout(bookingToEdit.id, payload);
          toast.success("Clase actualizada");
        } else {
          await createBlockout(payload);
          toast.success("Clase creada");
        }
      } else {
        const payload = {
          court_id: courtId,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          players: selectedPlayers.map((p) => ({
            id: p.id,
            price: p.price,
            is_paid: p.is_paid,
            payment_method: p.payment_method,
          })),
          is_fixed: isFixed,
          details: details,
        };

        if (bookingToEdit && !bookingToEdit.is_blockout) {
          await updateBooking(bookingToEdit.id, payload);
          toast.success("Actualizado exitosamente");
        } else {
          await createBooking(payload);
          toast.success("Creado exitosamente");
        }
      }

      onBookingAdded();
      onClose(); // Only close on success

      if (!bookingToEdit) {
        setSelectedPlayers([]);
        setDetails("");
        setClassReason("");
      }
    } catch (err) {
      console.error("DEBUG SUBMIT ERROR:", err);
      const errorMsg =
        err.message || err.error_description || "Error al guardar";
      const errorDetails = err.details || "";
      toast.error(`${errorMsg} ${errorDetails}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((p) => {
    const normalizedSearch = normalizeText(playerSearch);
    return (
      normalizeText(p.full_name).includes(normalizedSearch) ||
      (p.category && normalizeText(p.category).includes(normalizedSearch))
    );
  });

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
              {showDeleteConfirm
                ? isClass
                  ? "¿Eliminar Clase?"
                  : "¿Eliminar Reserva?"
                : showPaymentModal
                  ? "Registrar Pago"
                  : bookingToEdit
                    ? isClass
                      ? "Editar Clase"
                      : "Editar Reserva"
                    : isClass
                      ? "Nueva Clase"
                      : "Nueva Reserva"}
            </h2>
            {!showDeleteConfirm && !showPaymentModal && (
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                style={{ colorScheme: "dark" }}
                className="mt-1 bg-white/5 border border-white/10 rounded-2xl md:rounded-lg px-3 py-1.5 text-text-color text-xs md:text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer hover:bg-white/10 shadow-sm"
              />
            )}
          </div>
          <button
            onClick={onClose}
            className="md:p-2 p-0.5 rounded-2xl md:rounded-lg border cursor-pointer transition-all duration-300 text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
          >
            <BsX size={24} />
          </button>
        </div>

        {/* Content */}
        {showDeleteConfirm ? (
          <div className="flex-1 flex flex-col items-center justify-center md:p-8 p-4 text-center gap-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
              <BsTrash size={40} />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xl font-bold text-white">
                ¿Estás seguro de que deseas eliminar esta{" "}
                {isClass ? "clase" : "reserva"}?
              </p>
              <p className="text-text-color/60 text-sm">
                Esta acción no se puede deshacer y liberará el horario en la
                cancha.
              </p>
            </div>
            <div className="flex flex-col w-full gap-3 mt-4">
              {isFixed ? (
                <>
                  <button
                    type="button"
                    onClick={() => confirmDelete("single")}
                    disabled={loading}
                    className="h-[50px] flex items-center gap-3 px-2 md:px-4 py-1 md:py-3 rounded-2xl md:rounded-lg border cursor-pointer transition-all duration-300 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 justify-center"
                  >
                    {loading
                      ? "Eliminando..."
                      : `Eliminar solo ${isClass ? "esta clase" : "esta reserva"}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete("series")}
                    disabled={loading}
                    className="h-[50px] flex items-center gap-3 px-2 md:px-4 py-1 md:py-3 rounded-2xl md:rounded-lg border cursor-pointer transition-all duration-300 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 justify-center"
                  >
                    {loading ? "Eliminando..." : `Eliminar toda la serie`}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => confirmDelete("single")}
                  disabled={loading}
                  className="h-[50px] flex items-center gap-3 px-2 md:px-4 py-1 md:py-3 rounded-2xl md:rounded-lg border cursor-pointer transition-all duration-300 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 justify-center"
                >
                  {loading
                    ? "Eliminando..."
                    : `Sí, eliminar ${isClass ? "clase" : "reserva"}`}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="h-[50px] flex items-center gap-3 px-2 md:px-4 py-1 md:py-3 rounded-2xl md:rounded-lg border cursor-pointer transition-all duration-300 bg-white/5 text-text-color border-white/10 hover:bg-white/10 justify-center"
              >
                Volver a la edición
              </button>
            </div>
          </div>
        ) : showPaymentModal ? (
          <div className="flex-1 flex flex-col items-center justify-center md:p-8 p-4 text-center gap-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <BsPerson size={40} />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xl font-bold text-white">
                Seleccionar método de pago
              </p>
              <p className="text-text-color/60 text-sm">
                ¿Cómo realizó el pago {selectedPlayerForPayment?.full_name}?
              </p>
            </div>
            <div className="grid grid-cols-1 w-full gap-3">
              <div className="flex gap-2 md:gap-4">
                <button
                  type="button"
                  onClick={() => confirmPayment("Efectivo")}
                  className="w-full h-[50px] flex items-center gap-3 px-2 md:px-4 py-1 md:py-3 rounded-2xl md:rounded-lg border cursor-pointer transition-all duration-300 bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/30 justify-center"
                >
                  Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => confirmPayment("Transferencia")}
                  className="w-full h-[50px] flex items-center gap-3 px-2 md:px-4 py-1 md:py-3 rounded-2xl md:rounded-lg border cursor-pointer transition-all duration-300 bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 justify-center  "
                >
                  Transferencia
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="h-[50px] flex items-center gap-3 px-2 md:px-4 py-1 md:py-3 rounded-2xl md:rounded-lg border cursor-pointer transition-all duration-300 bg-white/5 text-text-color border-white/10 hover:bg-white/10 justify-center"
              >
                Volver a la edición
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 min-h-0 flex flex-col"
          >
            <div className="flex-1 overflow-y-auto md:px-4 px-2 pb-4 mt-4 custom-scrollbar ">
              <div className="flex flex-col gap-4">
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
                          className={`md:px-4 md:py-3 p-2 text-xs md:text-sm font-bold rounded-2xl md:rounded-lg transition-all border duration-300 flex flex-col items-center justify-center ${
                            courtId === court.id
                              ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30"
                              : occupied
                                ? "bg-gray-500/10 text-gray-500/50 border-gray-500/10 cursor-not-allowed opacity-70"
                                : "bg-background-color text-text-color/60 border-border-color hover:border-primary/50 cursor-pointer"
                          }`}
                        >
                          {court.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Manual Price & Checkboxes Toggles */}
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                  {!isClass ? (
                    <div
                      className="flex items-center gap-2 cursor-pointer group justify-center"
                      onClick={() => setManualPriceMode(!manualPriceMode)}
                    >
                      <div
                        className={`w-5 h-5 rounded-2xl md:rounded-lg border flex items-center justify-center transition-all ${
                          manualPriceMode
                            ? "bg-primary border-primary text-black"
                            : "border-text-color/30 group-hover:border-primary/50"
                        }`}
                      >
                        {manualPriceMode && <BsCheckLg size={12} />}
                      </div>
                      <span className="text-sm text-text-color select-none group-hover:text-primary transition-colors">
                        Precio especial
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-4 ml-auto">
                    {/* Fixed Booking Toggle */}
                    <div
                      className="flex items-center gap-2 cursor-pointer group justify-center"
                      onClick={() => setIsFixed(!isFixed)}
                    >
                      <div
                        className={`w-5 h-5 rounded-2xl md:rounded-lg border flex items-center justify-center transition-all ${
                          isFixed
                            ? "bg-primary border-primary text-black"
                            : "border-text-color/30 group-hover:border-primary/50"
                        }`}
                      >
                        {isFixed && <BsCheckLg size={12} />}
                      </div>
                      <span className="text-sm text-text-color select-none group-hover:text-primary transition-colors">
                        Fijo
                      </span>
                    </div>

                    {/* Class Toggle */}
                    <div
                      className={`flex items-center gap-2 cursor-pointer group justify-center ${bookingToEdit ? "opacity-50 pointer-events-none" : ""}`}
                      onClick={() => {
                        if (!bookingToEdit) {
                          const newIsClass = !isClass;
                          setIsClass(newIsClass);
                          if (newIsClass) setSelectedPlayers([]);
                        }
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded-2xl md:rounded-lg border flex items-center justify-center transition-all ${
                          isClass
                            ? "bg-primary border-primary text-black"
                            : "border-text-color/30 group-hover:border-primary/50"
                        }`}
                      >
                        {isClass && <BsCheckLg size={12} />}
                      </div>
                      <span className="text-sm text-text-color select-none group-hover:text-primary transition-colors">
                        Clase
                      </span>
                    </div>
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
                    className={`w-full pl-4 pr-4 py-2 rounded-2xl md:rounded-lg bg-background-color border text-text-color cursor-pointer flex items-center justify-between transition-all duration-300 ${
                      isTimeOpen
                        ? "border-primary/30"
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
                    className={`absolute z-20 top-full left-0 right-0 mt-2 bg-background-card-color border border-border-color rounded-2xl md:rounded-lg overflow-hidden shadow-xl transition-all duration-300 origin-top ${
                      isTimeOpen
                        ? "opacity-100 translate-y-0 scale-100 visible"
                        : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
                    }`}
                  >
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 md:p-4 flex flex-col gap-2">
                      {TIME_OPTIONS.map((time) => (
                        <div
                          key={time}
                          onClick={() => {
                            setStartTime(time);
                            setIsTimeOpen(false);

                            if (!isClass) {
                              const [h, m] = time.split(":").map(Number);
                              const defaultEnd = new Date();
                              defaultEnd.setHours(h, m + DURATION_MINUTES);
                              setEndTime(
                                defaultEnd.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                }),
                              );
                            }
                          }}
                          className={`p-2 md:p-4 rounded-2xl md:rounded-lg cursor-pointer text-sm transition-colors flex items-center justify-between ${
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

                <div
                  className="flex flex-col gap-2 relative"
                  ref={endTimeDropdownRef}
                >
                  <label className="text-sm font-medium text-text-color">
                    Horario Fin
                  </label>
                  <div
                    onClick={() => setIsEndTimeOpen(!isEndTimeOpen)}
                    className={`w-full pl-4 pr-4 py-2 rounded-2xl md:rounded-lg bg-background-color border text-text-color cursor-pointer flex items-center justify-between transition-all duration-300 ${
                      isEndTimeOpen
                        ? "border-primary/30"
                        : "border-border-color hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BsClock className="text-text-color/50" />
                      <span>{endTime}</span>
                    </div>
                    <BsChevronDown
                      className={`text-text-color/50 transition-transform duration-300 ${isEndTimeOpen ? "rotate-180" : ""}`}
                    />
                  </div>

                  {/* Dropdown Options */}
                  <div
                    className={`absolute z-20 top-full left-0 right-0 mt-2 bg-background-card-color border border-border-color rounded-2xl md:rounded-lg overflow-hidden shadow-xl transition-all duration-300 origin-top ${
                      isEndTimeOpen
                        ? "opacity-100 translate-y-0 scale-100 visible"
                        : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
                    }`}
                  >
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 md:p-4 flex flex-col gap-2">
                      {TIME_OPTIONS.filter((time) => time > startTime).map(
                        (time) => (
                          <div
                            key={time}
                            onClick={() => {
                              setEndTime(time);
                              setIsEndTimeOpen(false);
                            }}
                            className={`p-2 md:p-4 rounded-2xl md:rounded-lg cursor-pointer text-sm transition-colors flex items-center justify-between ${
                              endTime === time
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-text-color hover:bg-white/5"
                            }`}
                          >
                            {time}
                            {endTime === time && <BsCheckLg size={14} />}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {!isClass ? (
                  <>
                    {/* PLAYERS SECTION */}
                    <div className="flex items-center gap-3 text-primary">
                      <span className="h-px flex-1 bg-border-color"></span>
                      <span className="uppercase text-xs font-bold tracking-widest text-text-color-green">
                        Jugadores
                      </span>
                      <span className="h-px flex-1 bg-border-color"></span>
                    </div>

                    {/* Player Selector (Custom Dropdown) */}
                    <div
                      className="flex flex-col gap-2 relative"
                      ref={playerDropdownRef}
                    >
                      <label className="text-sm font-medium text-text-color">
                        Agregar Jugador
                      </label>
                      <div
                        onClick={() => setIsPlayerOpen(!isPlayerOpen)}
                        className={`w-full pl-4 pr-4 py-2 rounded-2xl md:rounded-lg bg-background-color border text-text-color cursor-pointer flex items-center justify-between transition-all duration-300 ${
                          isPlayerOpen
                            ? "border-primary/30"
                            : "border-border-color hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 text-text-color/50">
                          <BsPerson size={18} />
                          <span className="text-text-color">
                            Seleccionar jugador...
                          </span>
                        </div>
                        <BsChevronDown
                          className={`text-text-color/50 transition-transform duration-300 ${isPlayerOpen ? "rotate-180" : ""}`}
                        />
                      </div>

                      {/* Dropdown Options */}
                      <div
                        className={`absolute z-20 top-full left-0 right-0 mt-2 bg-background-card-color border border-border-color rounded-2xl md:rounded-lg overflow-hidden shadow-xl transition-all duration-300 origin-top ${
                          isPlayerOpen
                            ? "opacity-100 translate-y-0 scale-100 visible"
                            : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
                        }`}
                      >
                        {/* Search Input inside Dropdown */}
                        <div className="p-2 border-b border-border-color">
                          <div className="flex items-center bg-background-color rounded-2xl md:rounded-lg px-3 py-2 border border-border-color">
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
                                  className={`p-2 rounded-2xl md:rounded-lg cursor-pointer text-sm transition-colors flex items-center justify-between ${
                                    isSelected
                                      ? "bg-primary/10 text-primary font-medium"
                                      : "text-text-color hover:bg-white/5"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(
                                        player.full_name,
                                      )}`}
                                    >
                                      {getInitials(player.full_name)}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {player.full_name}
                                      </span>
                                      <span className="text-xs text-text-color/50">
                                        {player.is_student
                                          ? "Alumno"
                                          : "Visitante"}
                                      </span>
                                    </div>
                                  </div>
                                  {isSelected ? (
                                    <BsCheckLg
                                      size={16}
                                      className="text-primary"
                                    />
                                  ) : null}
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-3 flex flex-col gap-2">
                              <div className="text-center text-text-color/50 text-sm mb-1">
                                No se encontraron jugadores
                              </div>
                              {playerSearch.trim() !== "" && (
                                <div className="flex flex-col gap-2 bg-white/5 p-2 rounded-2xl md:rounded-lg border border-primary/20">
                                  <div
                                    className="flex items-center justify-center gap-2 px-1 cursor-pointer group"
                                    onClick={() =>
                                      setIsQuickAddStudent(!isQuickAddStudent)
                                    }
                                  >
                                    <div
                                      className={`w-5 h-5 border flex items-center justify-center transition-all duration-300 rounded-full ${
                                        isQuickAddStudent
                                          ? "bg-primary border-primary"
                                          : "border-text-color/50 group-hover:border-primary"
                                      }`}
                                    >
                                      {isQuickAddStudent && (
                                        <BsCheckLg
                                          size={14}
                                          className="text-white"
                                        />
                                      )}
                                    </div>
                                    <label className="text-sm text-text-color cursor-pointer select-none group-hover:text-primary transition-colors">
                                      ¿Es Alumno?
                                    </label>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleQuickAddPlayer}
                                    className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-2xl md:rounded-lg py-2 text-sm font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                  >
                                    <BsPlus size={18} />
                                    Agregar "{playerSearch}"
                                  </button>
                                </div>
                              )}
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
                          className="flex justify-between items-center bg-background-color p-2 md:p-4 rounded-2xl md:rounded-lg border border-border-color group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shrink-0 ${getAvatarColor(
                                player.full_name,
                              )}`}
                            >
                              {getInitials(player.full_name)}
                            </div>
                            <div>
                              <Link
                                to={`/admin/players/${player.id}`}
                                className="text-[12px] font-bold text-text-color hover:text-primary hover:underline transition-colors"
                              >
                                {player.full_name}
                              </Link>
                              <p className="text-xs text-text-color/50">
                                {player.is_student ? "Alumno" : "Visitante"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col-reverse md:flex-row items-center md:items-center gap-1 md:gap-3">
                              <button
                                type="button"
                                onClick={() => handleTogglePaid(player)}
                                className={`text-[8px] md:text-md font-bold px-2 py-1 rounded-2xl md:rounded-lg border transition-colors cursor-pointer ${
                                  player.is_paid
                                    ? player.payment_method === "Transferencia"
                                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
                                      : "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20"
                                    : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/20"
                                }`}
                              >
                                {player.is_paid
                                  ? player.payment_method === "Transferencia"
                                    ? "TRANSF."
                                    : "EFECTIVO"
                                  : "PENDIENTE"}
                              </button>

                              {manualPriceMode ? (
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-color/50 text-xs font-bold">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    value={player.price}
                                    onChange={(e) =>
                                      handleUpdatePlayerPrice(
                                        player.id,
                                        Number(e.target.value),
                                      )
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-20 bg-black/20 border border-white/10 px-2 py-1 pl-4 text-sm font-bold text-primary focus:outline-none focus:border-primary/50 rounded-2xl md:rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                              ) : (
                                <span className="text-xs md:text-sm font-bold text-primary">
                                  ${player.price}
                                </span>
                              )}
                            </div>
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

                    {/* Notes / Details for Regular Booking */}
                    <div className="flex flex-col gap-2 mt-2">
                      <label className="text-sm font-medium text-text-color">
                        Notas (Opcional)
                      </label>
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Algún detalle extra..."
                        rows={2}
                        className="w-full h-30 pl-4 pr-4 py-2 rounded-2xl md:rounded-lg bg-background-color border text-text-color flex items-center justify-between transition-all duration-300 border-border-color hover:border-primary/30 focus:outline-none resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 relative ">
                    <label className="text-sm font-medium text-text-color">
                      Nombre de la Clase
                    </label>
                    <input
                      type="text"
                      className="w-full pl-4 pr-4 py-2 rounded-2xl md:rounded-lg bg-background-color border text-text-color flex items-center justify-between transition-all duration-300 border-border-color hover:border-primary/30 focus:outline-none"
                      placeholder="Ej: CLASE Pamela"
                      value={classReason}
                      onChange={(e) => setClassReason(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-2 md:p-4 border-t border-border-color bg-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  {!isClass && (
                    <>
                      <span className="text-xs text-text-color/60">
                        Total a pagar
                      </span>
                      <span className="text-2xl font-bold text-white">
                        ${totalPrice.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-sm text-text-color/60">Finaliza</span>
                  <span className="text-sm font-bold text-primary">
                    {endTime}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 md:gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="md:h-[50px] w-full flex items-center justify-center md:px-4 md:py-3 p-2 gap-3 rounded-2xl md:rounded-lg border cursor-pointer transition-all duration-300 flex-col md:flex-row text-sm text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    (isClass
                      ? !classReason.trim()
                      : selectedPlayers.length === 0)
                  }
                  className={`md:h-[50px] w-full  flex items-center justify-center md:px-4 md:py-3 p-2 gap-3 rounded-2xl md:rounded-lg border cursor-pointer transition-all duration-300 flex-col md:flex-row text-sm 
                   ${
                     !loading &&
                     (isClass
                       ? classReason.trim().length > 0
                       : selectedPlayers.length > 0)
                       ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30"
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
                    className="gap-2 px-4 py-3 rounded-2xl md:rounded-lg border border-red-500/20 text-red-500 bg-red-500/10 hover:bg-red-500/15 cursor-pointer transition-all duration-300 font-medium flex items-center justify-center"
                  >
                    <BsTrash />
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
