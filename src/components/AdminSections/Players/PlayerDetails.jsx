import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BsPerson,
  BsTelephone,
  BsEnvelope,
  BsWallet2,
  BsDownload,
  BsChevronRight,
  BsCheckCircleFill,
  BsClockHistory,
  BsThreeDotsVertical,
} from "react-icons/bs";
import { supabase } from "../../../../supabaseClient";

export default function PlayerDetails() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const { data, error } = await supabase
          .from("players")
          .select(
            "*, booking_players(id, individual_price, is_paid, created_at, bookings(court_id, start_time, end_time, courts(name)))",
          )
          .eq("id", id)
          .single();

        if (error) throw error;
        setPlayer(data);
      } catch (error) {
        console.error("Error fetching player details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!player) return <div className="text-white">Player not found</div>;

  // Calculate pending debt
  const pendingDebt =
    player.booking_players?.reduce((acc, bp) => {
      return !bp.is_paid ? acc + (Number(bp.individual_price) || 0) : acc;
    }, 0) || 0;

  // Mock data for display based on image
  const joinedDate = new Date(player.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });

  // Format bookings for the table
  const bookings =
    player.booking_players?.map((bp) => {
      const booking = bp.bookings;
      const courtName = booking?.courts?.name || "Cancha desconocida";
      // Calculate duration
      const start = new Date(booking.start_time); // Assuming ISO string
      const end = new Date(booking.end_time);
      const duration = (end - start) / (1000 * 60); // minutes

      return {
        id: bp.id,
        date: start.toLocaleDateString("es-AR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        courtDetail: courtName, // Mock "Cancha de Arcilla #2"
        duration: `${duration} min`,
        amount: `$${bp.individual_price}`,
        status: bp.is_paid ? "Pagado" : "Pendiente",
      };
    }) || [];

  return (
    <div className="flex flex-col gap-4 w-full pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-text-color/50 text-sm font-medium">
        <Link
          to="/admin-panel/players"
          className="hover:text-primary transition-colors"
        >
          Players
        </Link>
        <BsChevronRight size={10} />
        <span className="text-white">{player.full_name}</span>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-background-card-color border border-border-color rounded-lg p-4 relative overflow-hidden group">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-all duration-500"></div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/10 flex items-center justify-center">
                <BsPerson size={48} className="text-white/50" />
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
                <span>Joined {joinedDate}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background-color border border-border-color flex items-center gap-4 group/box transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BsTelephone size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-color/50 font-bold uppercase tracking-wider">
                      Phone
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
        <div className="bg-[#123618] border border-primary/20 rounded-lg p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Decor */}
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <BsWallet2 size={64} className="text-primary" />
          </div>

          <div>
            <span className="text-[#6abd68] font-bold text-xs tracking-widest uppercase mb-1 block">
              Saldo Pendiente
            </span>
            <span className="text-5xl font-black text-white font-display tracking-tighter">
              ${pendingDebt.toFixed(2)}
            </span>
            <span className="text-white/40 text-sm mt-2 block italic text-xs">
              Vence pronto
            </span>
          </div>

          <button className="w-full py-4 bg-primary text-black font-bold rounded-lg hover:bg-[#4ab849] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-8">
            <BsWallet2 size={18} />
            <span>Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-8 border-b border-white/10 w-full relative ">
          {["bookings", "payments", "evaluations"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold tracking-wide transition-all relative cursor-pointer ${
                activeTab === tab
                  ? "text-primary"
                  : "text-text-color/60 hover:text-white"
              }`}
            >
              {tab === "bookings" && "Historial de Reservas"}
              {tab === "payments" && "Pagos Recientes"}

              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(92,205,91,0.5)]"></div>
              )}
            </button>
          ))}

          {/* Export CSV Button (absolute right) */}
          {/* <button className="absolute right-0 top-0 pb-3 flex items-center gap-2 text-primary text-xs font-bold hover:text-white transition-colors">
            <BsDownload size={14} />
            <span>Exportar CSV</span>
          </button> */}
        </div>
      </div>

      {/* Content Area - Table */}
      <div className="bg-background-card-color border border-border-color rounded-lg overflow-hidden mt-2">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-5 bg-white/5 border-b border-border-color text-[10px] font-bold text-text-color/50 uppercase tracking-widest">
          <div>Fecha</div>
          <div className="col-span-2">Detalle de Cancha</div>
          <div>Duración</div>
          <div>Importe</div>
          <div>Estado</div>
        </div>

        {/* Table Body */}
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="grid grid-cols-6 gap-4 p-5 border-b border-white/5 items-center hover:bg-white/5 transition-colors group"
              >
                <div className="text-white font-medium text-sm">
                  {booking.date}
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BsClockHistory size={14} />
                  </div>
                  <span className="text-text-color font-medium text-sm">
                    {booking.courtDetail}
                  </span>
                </div>
                <div className="text-text-color/60 text-sm">
                  {booking.duration}
                </div>
                <div className="text-white font-bold text-sm">
                  {booking.amount}
                </div>
                <div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      booking.status === "Pagado"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-text-color hover:text-white">
                  <BsThreeDotsVertical />
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
