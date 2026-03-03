import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StatsCard } from "../StatsCard";
import {
  BsCashStack,
  BsBank,
  BsCalendarCheck,
  BsSearch,
  BsWallet2,
  BsChevronLeft,
  BsChevronRight,
  BsCalendar3,
} from "react-icons/bs";
import {
  getPaymentHistory,
  getIncomeMetrics,
} from "../../../services/paymentService";

import { normalizeText } from "../../../utils/textUtils";

export default function Payments() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState({
    totalMonth: 0,
    totalToday: 0,
    totalCash: 0,
    totalTransfer: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePrevMonth = () => {
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1,
      1,
    );
    // Limit to January 2026
    if (newDate.getFullYear() < 2026) return;
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1),
    );
  };

  const isEnero2026 =
    selectedDate.getMonth() === 0 && selectedDate.getFullYear() === 2026;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [historyData, metricsData] = await Promise.all([
          getPaymentHistory(selectedDate),
          getIncomeMetrics(selectedDate),
        ]);
        setHistory(historyData);
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error loading payments data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedDate]);

  const filteredHistory = history.filter((p) => {
    const playerName = p.booking_players?.players?.full_name || "";
    const normalizedSearch = normalizeText(searchTerm);
    return normalizeText(playerName).includes(normalizedSearch);
  });

  const handleRowClick = (item) => {
    const booking = item.booking_players?.bookings;
    if (!booking) return;

    const date = new Date(booking.start_time);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    navigate(`/admin/bookings?date=${dateStr}&bookingId=${booking.id}`);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background-color/80 backdrop-blur-sm w-full py-2 border-b border-white/5 flex flex-row justify-between items-center gap-2 mb-2 md:gap-4 md:mb-4 ">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white md:text-3xl">Pagos</h1>
          <p className="text-text-color/70 text-xs md:text-sm">
            Historial por Mes
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between w-auto gap-2">
          <div className="h-[38px] md:h-[50px] flex items-center gap-2 bg-background-color px-2 rounded-2xl md:rounded-lg border border-border-color">
            <button
              onClick={handlePrevMonth}
              disabled={isEnero2026}
              className={`p-2 rounded-lg text-text-color transition-colors ${
                isEnero2026
                  ? "opacity-20 cursor-not-allowed"
                  : "hover:bg-white/5 cursor-pointer"
              }`}
            >
              <BsChevronLeft />
            </button>
            <div className="flex items-center gap-2 min-w-auto md:min-w-[180px] justify-center text-white font-medium capitalize text-sm md:text-base">
              <BsCalendar3 className="text-primary" />
              <span>
                {`${selectedDate.toLocaleString("es-AR", { month: "long" })} ${selectedDate.getFullYear()}`}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white/5 rounded-lg text-text-color transition-colors cursor-pointer"
            >
              <BsChevronRight />
            </button>
          </div>
          {/* <button
            onClick={() => setSelectedDate(new Date())}
            className="px-2 py-2 text-sm font-bold text-text-color hover:text-white transition-colors cursor-pointer"
          >
            Este Mes
          </button> */}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center w-full h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            <StatsCard
              title="Ingresos Hoy"
              value={`$${metrics.totalToday.toLocaleString()}`}
              icon={<BsWallet2 size={20} />}
              color="green"
            />
            <StatsCard
              title="Total Mensual"
              value={`$${metrics.totalMonth.toLocaleString()}`}
              icon={<BsCalendarCheck size={20} />}
              color="purple"
            />
            <StatsCard
              title="Efectivo (Mes)"
              value={`$${metrics.totalCash.toLocaleString()}`}
              icon={<BsCashStack size={20} />}
              color="yellow"
            />
            <StatsCard
              title="Transferencia (Mes)"
              value={`$${metrics.totalTransfer.toLocaleString()}`}
              icon={<BsBank size={20} />}
              color="blue"
            />
          </div>

          {/* History Section */}
          <div className="mt-2 md:mt-4 flex flex-col gap-2 md:gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
              <h2 className="text-[10px] font-bold text-text-color/50 uppercase tracking-[0.2em] w-full text-center md:text-left">
                Historial de Pagos -{" "}
                {selectedDate.toLocaleString("es-AR", { month: "long" })}
              </h2>

              {/* Search bar */}
              <div className="relative w-full md:w-72">
                <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-color/40" />
                <input
                  type="text"
                  placeholder="Buscar por jugador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background-card-color border border-border-color rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-text-color/30 focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-background-card-color border border-border-color rounded-2xl md:rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-5 gap-4 p-5 bg-white/5 border-b border-border-color text-[10px] font-bold text-text-color/50 uppercase tracking-widest">
                <div>Fecha de Pago</div>
                <div>Jugador</div>
                <div>Método</div>
                <div>Monto</div>
                <div>Fecha Turno</div>
              </div>

              {/* Table Body */}
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 p-2 md:p-4 hover:bg-white/5 transition-colors items-center border-b border-white/5 group cursor-pointer"
                    >
                      {/* Date */}
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">
                          {new Date(item.created_at).toLocaleDateString(
                            "es-AR",
                          )}
                        </span>
                        <span className="text-text-color/50 text-[10px]">
                          {new Date(item.created_at).toLocaleTimeString(
                            "es-AR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      {/* Player */}
                      <div className="text-white font-medium text-sm truncate">
                        {item.booking_players?.players ? (
                          <Link
                            to={`/admin/players/${item.booking_players.players.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-primary transition-colors block"
                          >
                            {item.booking_players.players.full_name}
                          </Link>
                        ) : (
                          "Desconocido"
                        )}
                      </div>
                      {/* Method */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border ${
                            item.payment_method === "Efectivo"
                              ? "bg-purple-500/10 text-purple-500 border-purple-500/10"
                              : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          }`}
                        >
                          {item.payment_method}
                        </span>
                      </div>
                      {/* Amount */}{" "}
                      <div className="text-white font-black text-sm">
                        ${Number(item.amount).toLocaleString()}
                      </div>
                      {/* Booking Date */}
                      <div className="text-text-color/50 text-xs flex items-center gap-2">
                        <BsCalendarCheck
                          size={12}
                          className="text-primary/50"
                        />
                        {item.booking_players?.bookings?.start_time
                          ? new Date(
                              item.booking_players.bookings.start_time,
                            ).toLocaleDateString("es-AR")
                          : "N/A"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-text-color/50 italic">
                    {searchTerm
                      ? "No se encontraron pagos para esta búsqueda."
                      : "No hay registros de pagos para este mes."}
                  </div>
                )}
              </div>
            </div>
            <div className="text-[10px] text-text-color/40 ml-2 uppercase tracking-widest font-bold">
              Total de registros: {filteredHistory.length}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
