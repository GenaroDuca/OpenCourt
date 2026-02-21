import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  BsTelephone,
  BsChevronRight,
  BsArrowUp,
  BsArrowDown,
} from "react-icons/bs";
import { TbEdit } from "react-icons/tb";

import { supabase } from "../../../../supabaseClient";
import NewPlayerForm from "./NewPlayerForm";

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

export default function PlayerDetails() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "rawDate",
    direction: "desc",
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const { data, error } = await supabase
          .from("players")
          .select(
            "*, booking_players(id, individual_price, is_paid, created_at, bookings(id, court_id, start_time, end_time, courts(name)), payments(amount, payment_method, paid_at))",
          )
          .eq("id", id)
          .single();

        if (error) throw error;

        // Simplify data structure
        if (data.booking_players) {
          data.booking_players = data.booking_players.map((bp) => {
            const sortedPayments =
              bp.payments?.sort(
                (a, b) => new Date(b.paid_at) - new Date(a.paid_at),
              ) || [];

            if (bp.is_paid && sortedPayments.length === 0) {
              console.warn(
                `Inconsistency found: BookingPlayer ${bp.id} is marked PAID but has no payment records.`,
                bp,
              );
            }

            return {
              ...bp,
              payment: sortedPayments.length > 0 ? sortedPayments[0] : null,
            };
          });
        }

        setPlayer(data);
      } catch (error) {
        console.error("Error fetching player details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id, refreshKey]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!player) return <div className="text-white">Player not found</div>;

  // Calculate pending debt (excluding future bookings)
  const pendingDebt =
    player.booking_players?.reduce((acc, bp) => {
      if (bp.is_paid) return acc;

      const startTime = bp.bookings?.start_time;
      if (!startTime) return acc;

      const bookingTime = new Date(startTime);
      const now = new Date();

      if (bookingTime > now) {
        return acc; // Future booking, not debt yet
      }

      return acc + (Number(bp.individual_price) || 0);
    }, 0) || 0;

  const totalContributed =
    player.booking_players?.reduce((acc, bp) => {
      return bp.is_paid ? acc + (Number(bp.individual_price) || 0) : acc;
    }, 0) || 0;

  // Mock data for display based on image
  const joinedDate = new Date(player.created_at).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });

  // Format and Filter bookings for the table
  const bookings =
    player.booking_players
      ?.map((bp) => {
        const booking = bp.bookings;
        const courtName = booking?.courts?.name || "Cancha desconocida";
        // Calculate duration
        const start = new Date(booking.start_time); 
        const end = new Date(booking.end_time);
        const duration = (end - start) / (1000 * 60); // minutes

        const payment = bp.payment;

        // Check status logic
        const now = new Date();
        const isFuture = start > now;

        let statusRaw = "Pendiente";
        if (bp.is_paid) statusRaw = "Pagado";
        else if (isFuture) statusRaw = "Reservado";

        return {
          id: bp.id,
          date: start.toLocaleDateString("es-AR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          time: `${start.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${end.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          courtDetail: courtName,
          duration: `${duration} min`,
          amount: `$${bp.individual_price}`,
          status: statusRaw,
          paymentMethod: payment?.payment_method || "-",
          paidAt: payment?.paid_at
            ? new Date(payment.paid_at).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                minute: "2-digit",
              })
            : "-",
          rawDate: booking.start_time,
          bookingId: booking.id,
        };
      })
      .filter((b) => {
        const now = new Date();
        const isFuture = new Date(b.rawDate) > now;
        if (activeTab === "future_bookings") return isFuture;
        if (activeTab === "bookings") return !isFuture;
        return true;
      })
      .sort((a, b) => {
        const { key, direction } = sortConfig;
        let valA = a[key];
        let valB = b[key];

        // Handle numeric amount comparison
        if (key === "amount") {
          valA = Number(valA.replace("$", ""));
          valB = Number(valB.replace("$", ""));
        }

        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
      }) || [];

  const handleBookingClick = (booking) => {
    const dateObj = new Date(booking.rawDate);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    navigate(`/admin/bookings?date=${dateStr}&bookingId=${booking.bookingId}`);
  };

  return (
    <div className="flex flex-col md:gap-4 gap-2 w-full pb-10">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-color/50 text-sm font-medium">
          <Link
            to="/admin/players"
            className="hover:text-primary transition-colors"
          >
            Jugadores
          </Link>
          <BsChevronRight size={10} />
          <span className="text-white">{player.full_name}</span>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="md:h-[50px] flex items-center md:px-4 md:py-3 p-2 gap-2 rounded-lg border cursor-pointer transition-all duration-300 flex-col md:flex-row text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30"
        >
          <TbEdit size={20} />
          <span className="hidden md:block">Editar</span>
        </button>
      </div>

      <NewPlayerForm
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onPlayerAdded={() => setRefreshKey((prev) => prev + 1)}
        playerToEdit={player}
      />

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-background-card-color border border-border-color md:rounded-lg rounded-2xl p-4 relative overflow-hidden group">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-all duration-500"></div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
            {/* Avatar */}
            <div className="relative">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl ring-4 ring-white/5 ${getAvatarColor(
                  player.full_name,
                )}`}
              >
                {getInitials(player.full_name)}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-4 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {player.full_name}
                </h1>
                {player.is_student && (
                  <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black tracking-wider uppercase border border-primary/20">
                    ALUMNO
                  </span>
                )}
                {player.category && (
                  <span className="px-3 py-1 rounded-lg bg-white/5 text-text-color/60 text-[10px] font-bold tracking-wider uppercase border border-white/5">
                    {player.category}
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-text-color/60 text-sm mb-6 flex-col ">
                <span className="text-primary">ID: #{player.id}</span>
                <span>Registrado el {joinedDate}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className=" rounded-lg flex items-center gap-4 group/box transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BsTelephone size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-color/50 font-bold uppercase tracking-wider">
                      Teléfono
                    </span>
                    <span className="text-white font-medium">
                      {player.phone || "Sin teléfono"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Card */}
        <div className="bg-background-card-color border border-border-color rounded-2xl md:rounded-lg  md:p-4 p-2 flex items-center justify-between relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col  gap-2 relative z-10">
            <span className="text-yellow-500 font-bold text-xs tracking-widest uppercase block text-center md:text-left">
              Saldo Pendiente
            </span>
            <span className="text-2xl font-black text-white font-display tracking-tighter text-center md:text-left">
              ${pendingDebt.toLocaleString()}
            </span>
          </div>

          <div className="h-12 w-px bg-white/10 mx-2 md:mx-6 relative z-10"></div>

          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-green-500 font-bold text-xs tracking-widest uppercase block text-center md:text-left">
              Valor Aportado
            </span>
            <span className="text-2xl font-black text-white font-display tracking-tighter text-center md:text-left">
              ${totalContributed.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 md:gap-8 border-b border-white/10 w-full relative ">
          {["bookings", "future_bookings", "payments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 w-full md:w-auto md:text-sm text-[12px] font-bold tracking-wide transition-all relative cursor-pointer ${
                activeTab === tab
                  ? "text-primary"
                  : "text-text-color/60 hover:text-white"
              } ${tab === "payments" ? "hidden" : ""}`}
            >
              {tab === "bookings" && "Reservas Pasadas"}
              {tab === "future_bookings" && "Reservas Futuras"}
              {/* {tab === "payments" && "Pagos Recientes"} */}

              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(92,205,91,0.5)]"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area - Table */}
      <div className="bg-background-card-color border border-border-color md:rounded-lg rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-5 gap-4 p-5 bg-white/5 border-b border-border-color text-[10px] font-bold text-text-color/50 uppercase tracking-widest">
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
            onClick={() => handleSort("rawDate")}
          >
            Fecha
            {sortConfig.key === "rawDate" &&
              (sortConfig.direction === "asc" ? (
                <BsArrowUp />
              ) : (
                <BsArrowDown />
              ))}
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
            onClick={() => handleSort("courtDetail")}
          >
            Cancha
            {sortConfig.key === "courtDetail" &&
              (sortConfig.direction === "asc" ? (
                <BsArrowUp />
              ) : (
                <BsArrowDown />
              ))}
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
            onClick={() => handleSort("amount")}
          >
            Importe
            {sortConfig.key === "amount" &&
              (sortConfig.direction === "asc" ? (
                <BsArrowUp />
              ) : (
                <BsArrowDown />
              ))}
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
            onClick={() => handleSort("paymentMethod")}
          >
            Método Pago
            {sortConfig.key === "paymentMethod" &&
              (sortConfig.direction === "asc" ? (
                <BsArrowUp />
              ) : (
                <BsArrowDown />
              ))}
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors text-right md:text-left"
            onClick={() => handleSort("status")}
          >
            Estado
            {sortConfig.key === "status" &&
              (sortConfig.direction === "asc" ? (
                <BsArrowUp />
              ) : (
                <BsArrowDown />
              ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => handleBookingClick(booking)}
                className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 hover:bg-white/5 transition-colors items-center cursor-pointer group border-b border-border-color"
              >
                {/* Date */}
                <div className="flex flex-col col-span-2 md:col-span-1 order-1 md:order-1">
                  <span className="text-white font-bold text-sm">
                    {booking.date}
                  </span>
                  <span className="text-text-color/50 text-xs flex items-center gap-1">
                    {booking.time}
                  </span>
                </div>
                {/* Court */}
                <div className="text-text-color/70 text-sm col-span-2 md:col-span-1 order-3 md:order-2 group-hover:text-primary transition-colors truncate">
                  {booking.courtDetail}
                </div>

                {/* Amount */}
                <div className="text-white font-bold text-sm col-span-1 md:col-span-1 order-4 md:order-3">
                  {booking.amount}
                </div>

                {/* Payment Info */}
                <div className="flex flex-col col-span-1 md:col-span-1 order-5 md:order-4">
                  <span className="text-xs text-white font-bold uppercase">
                    {booking.paymentMethod}
                  </span>
                  <span className="text-[10px] text-text-color/50">
                    {booking.paidAt}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2 md:col-span-1 flex justify-start md:justify-start order-2 md:order-5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      booking.status === "Pagado"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : booking.status === "Reservado"
                          ? "bg-white/10 text-white/70 border-white/10"
                          : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-text-color/50 italic">
              No hay historial de reservas.
            </div>
          )}
        </div>
      </div>
      <div className="text-xs text-text-color/40 mt-2 ml-2">
        Mostrando {bookings.length} reserva(s)
      </div>
    </div>
  );
}
