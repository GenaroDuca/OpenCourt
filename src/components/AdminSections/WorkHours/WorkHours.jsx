import { useState, useEffect } from "react";
import { getAccumulatedHours } from "../../../services/workerService";
import { BsChevronLeft, BsChevronRight, BsClockHistory } from "react-icons/bs";

export default function WorkHours() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workerStats, setWorkerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkerId, setExpandedWorkerId] = useState(null);

  const currentDate = new Date();
  const isCurrentMonth =
    selectedDate.getMonth() === currentDate.getMonth() &&
    selectedDate.getFullYear() === currentDate.getFullYear();

  const handlePrevMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1),
    );
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const stats = await getAccumulatedHours(selectedDate);
        setWorkerStats(stats);
      } catch (err) {
        console.error("Error fetching worker stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedDate]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="sticky top-0 z-20 flex md:flex-row justify-between items-center gap-2 md:gap-4 bg-background-color/80 backdrop-blur-sm w-full py-2 border-b border-white/5">
        <div>
          <h1 className="text-xl md:text-3xl font-bold font-display text-white tracking-tight">
            Horas Trabajadas
          </h1>
          <p className="text-text-color/60 text-xs md:text-sm">
            Control de horas por trabajador
          </p>
        </div>
      </div>

      <div className="bg-background-card-color rounded-2xl md:rounded-lg p-2 md:p-6 shadow-xl border border-border-color/50">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white/5 text-text-color/50 hover:text-white transition-colors rounded-lg cursor-pointer"
          >
            <BsChevronLeft size={20} />
          </button>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-wider capitalize">
            {selectedDate.toLocaleString("es-AR", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            className={`p-2 rounded-lg transition-colors ${
              isCurrentMonth
                ? "text-text-color/20 cursor-not-allowed"
                : "hover:bg-white/5 text-text-color/50 hover:text-white cursor-pointer"
            }`}
          >
            <BsChevronRight size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {workerStats.length === 0 ? (
              <div className="col-span-full text-center text-text-color/50 py-10">
                No hay registros para este mes.
              </div>
            ) : (
              workerStats.map((worker) => {
                const completos = worker.coverages.filter((c) => c.isComplete);
                const incompletos = worker.coverages.filter(
                  (c) => !c.isComplete,
                );
                const isExpanded = expandedWorkerId === worker.id;

                return (
                  <div
                    key={worker.id}
                    onClick={() =>
                      setExpandedWorkerId(isExpanded ? null : worker.id)
                    }
                    className={`bg-white/5 border ${isExpanded ? "border-primary/50" : "border-white/10"} rounded-2xl md:rounded-lg p-4 md:p-6 flex flex-col gap-4 hover:border-primary/30 transition-all cursor-pointer`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                        {worker.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {worker.name}
                        </h3>
                        <p className="text-xs text-text-color/50">
                          {worker.email}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-white/10 w-full my-2"></div>

                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xs text-text-color/50 uppercase tracking-wider">
                          Minutos Totales
                        </span>
                        <span className="text-xl font-bold text-white">
                          {worker.totalMinutes} min
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xs text-text-color/50 uppercase tracking-wider">
                          Horas Totales
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {worker.totalHours.toFixed(2)} hs
                        </span>
                      </div>
                    </div>

                    {/* Detalles Expandidos */}
                    {isExpanded && (
                      <div
                        className="mt-4 border-t border-white/10 pt-4 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Completos */}
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                              Turnos Completos ({completos.length})
                            </h4>
                          </div>
                          {completos.length === 0 ? (
                            <p className="text-xs text-text-color/50 italic">
                              No hay turnos completos.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 gap-2">
                              {completos.map((cov) => {
                                const d = new Date(cov.booking.start_time);
                                return (
                                  <div
                                    key={cov.id}
                                    className="flex justify-between items-center bg-background-color p-2 md:p-3 rounded-2xl md:rounded-lg border border-border-color"
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-text-color capitalize">
                                        {d.toLocaleDateString("es-AR", {
                                          weekday: "short",
                                          day: "2-digit",
                                          month: "short",
                                        })}
                                      </span>
                                      <span className="text-xs text-text-color/50">
                                        {cov.booking.courts?.name} •{" "}
                                        {d.toLocaleTimeString("es-AR", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-2xl md:rounded-lg">
                                      {cov.duration} min
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Incompletos */}
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                              Turnos Incompletos ({incompletos.length})
                            </h4>
                          </div>
                          {incompletos.length === 0 ? (
                            <p className="text-xs text-text-color/50 italic">
                              No hay turnos incompletos.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 gap-2">
                              {incompletos.map((cov) => {
                                const d = new Date(cov.booking.start_time);
                                return (
                                  <div
                                    key={cov.id}
                                    className="flex justify-between items-center bg-background-color p-2 md:p-3 rounded-2xl md:rounded-lg border border-border-color"
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-text-color capitalize">
                                        {d.toLocaleDateString("es-AR", {
                                          weekday: "short",
                                          day: "2-digit",
                                          month: "short",
                                        })}
                                      </span>
                                      <span className="text-xs text-text-color/50">
                                        {cov.booking.courts?.name} •{" "}
                                        {d.toLocaleTimeString("es-AR", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-2xl md:rounded-lg">
                                      {cov.duration} min
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
