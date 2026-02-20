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
  highlightedBookingId,
}) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeIndicatorPosition = React.useMemo(() => {
    const sDate = new Date(selectedDate);
    const now = currentTime;

    if (
      sDate.getDate() !== now.getDate() ||
      sDate.getMonth() !== now.getMonth() ||
      sDate.getFullYear() !== now.getFullYear()
    ) {
      return null;
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Start 9:00
    const startMinutes = 9 * 60;
    const nowMinutes = currentHour * 60 + currentMinute;

    const diff = nowMinutes - startMinutes;
    if (diff < 0 || diff > 15 * 60) return null;

    const slotHeight = isMobile ? 40 : 80;
    const gap = 8;

    const slots = Math.floor(diff / 30);
    const minutesInSlot = diff % 30;

    return slots * (slotHeight + gap) + (minutesInSlot / 30) * slotHeight;
  }, [currentTime, selectedDate, isMobile]);

  React.useEffect(() => {
    // Only scroll to time if NO specific booking is highlighted
    if (
      !highlightedBookingId &&
      timeIndicatorPosition !== null &&
      scrollRef.current
    ) {
      scrollRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [bookings, selectedDate, timeIndicatorPosition, highlightedBookingId]);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    if (highlightedBookingId) {
      let attempts = 0;
      const maxAttempts = 10;

      const textInterval = setInterval(() => {
        const element = document.getElementById(
          `booking-${highlightedBookingId}`,
        );
        attempts++;

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-primary", "scale-105", "z-50");
          setTimeout(() => {
            element.classList.remove(
              "ring-2",
              "ring-primary",
              "scale-105",
              "z-50",
            );
          }, 3000);
          clearInterval(textInterval);
        } else if (attempts >= maxAttempts) {
          clearInterval(textInterval);
        }
      }, 100);

      return () => clearInterval(textInterval);
    }
  }, [highlightedBookingId, bookings]);

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
    <div>
      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4">
        {courts.map((court, index) => (
          <div
            key={court.id}
            className="bg-background-card-color rounded-2xl md:rounded-lg p-2 md:p-4 border border-white/5 flex flex-col gap-2 md:gap-4"
          >
            {/* Column Header */}
            <div className="flex justify-center items-center py-1">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-bold text-white text-xs md:text-lg text-center truncate">
                    {court.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Slots */}
            <div className="flex flex-col gap-2 relative">
              {timeIndicatorPosition !== null && index === 0 && (
                <div
                  ref={scrollRef}
                  className="absolute left-[-10px] md:left-[-20px] z-[1] flex items-center pointer-events-none lg:w-[calc(300%+140px)] md:w-[calc(200%+16px)] w-[calc(300%+65px)]"
                  style={{ top: `${timeIndicatorPosition}px` }}
                >
                  <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg shadow-md shrink-0 mr-1 z-50">
                    {currentTime.toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                  <div className="h-[2px] bg-red-500 w-full shadow-sm rounded-full opacity-80 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-sm" />
                  </div>
                </div>
              )}
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

                  const isBlock = bookingPlayers.length === 0;
                  const isFixed = booking.is_fixed;

                  return (
                    <div
                      key={slot}
                      id={`booking-${booking.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick(booking);
                      }}
                      style={{ height: `${height}px` }}
                      className={`bg-linear-to-br ${
                        isBlock
                          ? "bg-zinc-900/50 border-white/5 border-dashed hover:bg-zinc-900/80 transition-colors"
                          : isFixed
                            ? "from-blue-500/20 to-blue-500/5 border-blue-500/20 hover:shadow-blue-500/10 hover:border-blue-500/40"
                            : "from-primary/20 to-primary/5 border-primary/20 hover:shadow-primary/10 hover:border-primary/40"
                      } border rounded-2xl md:rounded-lg p-2 md:p-5 flex flex-col gap-1 md:gap-2 relative group overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer`}
                    >
                      {/* Hover Glow Effect */}
                      <div
                        className={`absolute inset-0 ${
                          isBlock
                            ? "bg-transparent"
                            : isFixed
                              ? "bg-blue-500/5"
                              : "bg-primary/5"
                        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />

                      {/* Top Row: Time */}
                      <div className="flex justify-center md:justify-between items-start relative z-10 gap-1">
                        <div className="flex items-center gap-1 ">
                          <span
                            className={`w-full text-center md:w-auto ${
                              isBlock
                                ? "bg-zinc-800/50 border-zinc-700/50 text-zinc-500"
                                : isFixed
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
                            <span
                              className={`hidden md:block text-center px-1 py-0.5 md:px-2 md:py-1 border text-[8px] md:text-[10px] font-black uppercase rounded-lg tracking-wider shadow-sm backdrop-blur-sm ${
                                isBlock
                                  ? "bg-white/10 border-white/20 text-white/50"
                                  : "bg-blue-500/10 border-blue-500/30 text-blue-500"
                              }`}
                            >
                              Fijo
                            </span>
                          )}
                        </div>

                        {/* Paid Icon - Only for bookings */}
                        {!isBlock && isPaid ? (
                          <div className="hidden w-3.5 h-3.5 md:w-6 md:h-6 md:flex rounded-full bg-primary/20 border border-primary/30 items-center justify-center text-primary shadow-sm shrink-0">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        ) : !isBlock && showPendingWarning ? (
                          <div className="hidden w-3.5 h-3.5 md:w-6 md:h-6 md:flex rounded-full bg-yellow-500/20 border border-yellow-500/30 items-center justify-center text-yellow-500 shadow-sm shrink-0 animate-pulse">
                            <span className="text-[10px] font-bold">!</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Content: Players or Block Details */}
                      <div className=" flex-1 flex flex-col justify-between md:justify-center relative min-h-0 gap-4">
                        {isBlock ? (
                          <div className="flex items-center justify-center h-full">
                            <span className="font-bold text-[10px] md:text-sm text-zinc-600 text-center italic leading-tight uppercase tracking-wider">
                              {booking.details || "DESHABILITADO"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5 overflow-hidden justify-end h-full">
                            {bookingPlayers.length > 0 ? (
                              bookingPlayers.map((bp) => (
                                <span
                                  key={bp.id}
                                  className="font-bold text-[8px] text-center md:text-left md:text-xl text-white leading-tight drop-shadow-sm transition-colors block"
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
                        )}
                      </div>

                      {/* Bottom Layout: Status (Only for regular bookings) */}
                      {!isBlock && (
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
                              <span className="hidden md:inline">
                                Jugadores
                              </span>
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
                                  ? "Pendiente"
                                  : "Reservado"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Decorative background element */}
                      <div
                        className={`hidden md:block absolute -bottom-4 -right-4 w-24 h-24 ${
                          isBlock
                            ? "bg-white/5"
                            : isFixed
                              ? "bg-blue-500/10"
                              : "bg-primary/10"
                        } rounded-full blur-2xl ${
                          isBlock
                            ? "group-hover:bg-white/10"
                            : isFixed
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
