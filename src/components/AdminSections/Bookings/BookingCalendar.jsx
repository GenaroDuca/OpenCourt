import React from "react";
import { BsPlus, BsPerson } from "react-icons/bs";

const TIME_SLOTS = [];
for (let i = 9; i < 24; i++) {
  TIME_SLOTS.push(`${i.toString().padStart(2, "0")}:00`);
  if (i < 23) {
    TIME_SLOTS.push(`${i.toString().padStart(2, "0")}:30`);
  }
}

export default function BookingCalendar({
  bookings,
  courts,
  selectedDate,
  onSlotClick,
  onBookingClick,
}) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getBookingForSlot = (courtId, slotStart) => {
    // Return booking if it covers this slot
    return bookings.find((b) => {
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);

      const bStartStr = bStart.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return b.court_id === courtId && bStartStr === slotStart;
    });
  };

  const isSlotOccupied = (courtId, slotStart) => {
    // Convert slot start to date object for comparison
    const [hours, minutes] = slotStart.split(":").map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hours, minutes, 0, 0);

    return bookings.some((b) => {
      if (b.court_id !== courtId) return false;
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      return slotDate >= bStart && slotDate < bEnd;
    });
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4">
        {courts.map((court) => (
          <div
            key={court.id}
            className="bg-background-card-color rounded-lg p-2 md:p-4 border border-white/5 flex flex-col gap-2 md:gap-4"
          >
            {/* Column Header */}
            <div className="flex justify-center items-center mb-1 md:mb-2 px-1">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-bold text-white text-xs md:text-lg text-center truncate">
                    {court.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Slots */}
            <div className="flex flex-col gap-2">
              {TIME_SLOTS.map((slot) => {
                const booking = getBookingForSlot(court.id, slot);
                const occupied = isSlotOccupied(court.id, slot);

                if (booking) {
                  const bookingPlayers = booking.booking_players || [];
                  const isPaid = booking.booking_players?.every(
                    (bp) => bp.is_paid,
                  );

                  // Count total players
                  const count = booking.booking_players?.length || 0;

                  // Calculate total value
                  const totalValue =
                    booking.booking_players?.reduce(
                      (acc, bp) => acc + (Number(bp.individual_price) || 0),
                      0,
                    ) || 0;

                  // Calculate height based on duration
                  const start = new Date(booking.start_time);
                  const end = new Date(booking.end_time);
                  const diffMs = end - start;
                  const durationMinutes = Math.round(diffMs / (1000 * 60));
                  const slotsCount = Math.ceil(durationMinutes / 30);

                  const gap = 8;
                  const slotHeight = isMobile ? 40 : 80;
                  const height =
                    slotsCount * slotHeight + (slotsCount - 1) * gap;

                  const bookingObj = new Date(start);
                  const nowObj = new Date();

                  const bookingAtMidnight = new Date(
                    bookingObj.getFullYear(),
                    bookingObj.getMonth(),
                    bookingObj.getDate(),
                  );
                  const todayAtMidnight = new Date(
                    nowObj.getFullYear(),
                    nowObj.getMonth(),
                    nowObj.getDate(),
                  );

                  const isFutureDay =
                    bookingAtMidnight.getTime() > todayAtMidnight.getTime();

                  const showPendingWarning = !isPaid && !isFutureDay;

                  const isFixed = booking.is_fixed;

                  return (
                    <div
                      key={slot}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick(booking);
                      }}
                      style={{ height: `${height}px` }}
                      className={`bg-linear-to-br ${
                        isFixed
                          ? "from-blue-500/20 to-blue-500/5 border-blue-500/20 hover:shadow-blue-500/10 hover:border-blue-500/40"
                          : "from-primary/20 to-primary/5 border-primary/20 hover:shadow-primary/10 hover:border-primary/40"
                      } border rounded-2xl md:rounded-lg p-2 md:p-5 flex flex-col gap-1 md:gap-2 relative group overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer`}
                    >
                      {/* Hover Glow Effect */}
                      <div
                        className={`absolute inset-0 ${
                          isFixed ? "bg-blue-500/5" : "bg-primary/5"
                        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />

                      {/* Top Row: Time */}
                      <div className="flex justify-between items-start relative z-10 gap-1">
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-full text-center md:w-auto ${
                              isFixed
                                ? "bg-blue-500/20 border-blue-500/20 text-blue-500"
                                : "bg-primary/20 border-primary/20 text-primary"
                            } border px-1 py-0.5 md:px-3 md:py-1 rounded-lg text-[8px] md:text-xs font-bold backdrop-blur-sm shadow-sm whitespace-nowrap overflow-hidden text-ellipsis`}
                          >
                            {start.toLocaleTimeString(["es-ES"], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            -
                            {end.toLocaleTimeString(["es-ES"], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isFixed && (
                            <span className="text-center px-1 py-0.5 md:px-2 md:py-1 border text-[8px] md:text-[10px] font-black uppercase rounded-lg tracking-wider shadow-sm backdrop-blur-sm bg-blue-500/10 border-blue-500/30 text-blue-500">
                              Fijo
                            </span>
                          )}
                        </div>

                        {/* Paid Icon - Visible on all screens for quick status */}
                        {isPaid ? (
                          <div className="hidden w-3.5 h-3.5 md:w-6 md:h-6 md:flex rounded-full bg-primary/20 border border-primary/30 items-center justify-center text-primary shadow-sm shrink-0">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-2.5 h-2.5 md:w-3.5 md:h-3.5"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        ) : showPendingWarning ? (
                          <div className="hidden w-3.5 h-3.5 md:w-6 md:h-6 md:flex rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 items-center justify-center text-[8px] md:text-[10px] font-bold shadow-sm shrink-0">
                            !
                          </div>
                        ) : null}
                      </div>

                      {/* Content: Players */}
                      <div className=" flex-1 flex flex-col justify-between md:justify-end relative z-10 min-h-0 gap-4">
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                          {bookingPlayers.length > 0 ? (
                            bookingPlayers.map((bp) => (
                              <span
                                key={bp.id}
                                className="font-bold text-[8px] md:text-xl text-white leading-tight drop-shadow-sm transition-colors block"
                              >
                                {bp.players?.full_name || "Desconocido"}
                              </span>
                            ))
                          ) : (
                            <span className="font-bold text-[8px] md:text-sm text-white">
                              Desconocido
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Layout: Status */}
                      <div className="flex items-end justify-center md:justify-between gap-1 relative z-10">
                        <div
                          className={`hidden md:flex items-center gap-1 md:gap-2 ${
                            isFixed ? "text-blue-500/80" : "text-primary/80"
                          } text-[8px] md:text-sm font-medium `}
                        >
                          <BsPerson
                            size={14}
                            className="md:w-[20px] md:h-[20px]"
                          />
                          <span className="text-[12px] md:text-sm">
                            {count}{" "}
                            <span className="hidden md:inline">Jugadores</span>
                          </span>
                        </div>

                        <div className="flex gap-0 md:gap-1 flex-col items-center md:items-end">
                          <span className="text-[12px] md:text-base font-bold text-white drop-shadow-md pb-0.5 ">
                            ${totalValue.toLocaleString()}
                          </span>
                          <span
                            className={`text-center px-1 py-0.5 md:px-2 md:py-1 border text-[8px] md:text-[10px] font-black uppercase rounded-lg tracking-wider shadow-sm backdrop-blur-sm ${
                              isPaid
                                ? "bg-green-500/10 border-green-500/30 text-green-500"
                                : showPendingWarning
                                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                                  : "bg-white/10 border-white/20 text-white/50"
                            }`}
                          >
                            {isPaid
                              ? "Pagado"
                              : showPendingWarning
                                ? "Pago Pendiente"
                                : "Reservado"}
                          </span>
                        </div>
                      </div>

                      {/* Decorative background element - hidden on mobile to screen clutter */}
                      <div
                        className={`hidden md:block absolute -bottom-4 -right-4 w-24 h-24 ${
                          isFixed ? "bg-blue-500/10" : "bg-primary/10"
                        } rounded-full blur-2xl ${
                          isFixed
                            ? "group-hover:bg-blue-500/20"
                            : "group-hover:bg-primary/20"
                        } transition-all duration-500`}
                      />
                    </div>
                  );
                }

                if (occupied) {
                  return null;
                }

                return (
                  <div
                    key={slot}
                    onClick={() => onSlotClick(court.id, slot)}
                    className="border border-dashed border-white/10 rounded-2xl md:rounded-lg p-2 md:p-4 flex md:flex-row items-center gap-1 md:gap-0 md:justify-between justify-center md:h-[80px] h-[40px] hover:border-white/20 hover:bg-white/2 transition-all cursor-pointer group"
                  >
                    <span className="text-white/30 text-[10px] md:text-sm font-bold group-hover:text-white/50 transition-colors bg-white/5 px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg">
                      {slot}
                    </span>
                    <div className="flex items-center gap-2 md:gap-3 text-white/20 group-hover:text-primary transition-colors pr-0 md:pr-2">
                      <span className="text-xs font-bold uppercase tracking-wider hidden md:group-hover:block transition-all">
                        Reservar
                      </span>
                      <div className="w-5 h-5 md:w-8 md:h-8 border border-current flex items-center justify-center bg-white/5 group-hover:bg-primary/10 group-hover:border-primary/50 rounded-lg">
                        <BsPlus size={14} className="md:w-5 md:h-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
