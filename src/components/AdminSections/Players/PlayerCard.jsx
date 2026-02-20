import {
  BsTelephone,
  BsChevronRight,
  BsPerson,
  BsExclamationCircleFill,
  BsCheckCircleFill,
} from "react-icons/bs";

import { useNavigate } from "react-router-dom";

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

export default function PlayerCard({ data }) {
  const navigate = useNavigate();
  const bookings = data.booking_players || [];

  const totalContributed = bookings.reduce((sum, booking) => {
    if (booking.is_paid) {
      return sum + (Number(booking.individual_price) || 0);
    }
    return sum;
  }, 0);

  const hasPendingPayment = bookings.some((bp) => {
    if (bp.is_paid) return false;

    // Check if the booking is in the future
    const startTime = bp.bookings?.start_time;
    if (!startTime) return false;

    const bookingTime = new Date(startTime);
    const now = new Date();

    const bookingDay = new Date(
      bookingTime.getFullYear(),
      bookingTime.getMonth(),
      bookingTime.getDate(),
    );
    const currentDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    // If booking is in the future, it's not pending yet (for display purposes)
    const isFutureDay = bookingDay.getTime() > currentDay.getTime();

    return !isFutureDay;
  });

  return (
    <div
      onClick={() => navigate(`/admin-panel/players/${data.id}`)}
      className="bg-background-card-color border border-border-color p-2 md:p-4  rounded-2xl md:rounded-lg flex flex-col justify-between gap-2 md:gap-4 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden cursor-pointer"
    >
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 transition-all duration-500 group-hover:bg-primary/10"></div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-inner ${getAvatarColor(
            data.full_name,
          )}`}
        >
          {getInitials(data.full_name)}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold tracking-widest text-text-color/50 uppercase">
            Status
          </span>
          {hasPendingPayment ? (
            <div className=" px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 flex items-center gap-2 text-xs font-bold">
              <BsExclamationCircleFill size={10} />
              <span>PAGO PENDIENTE</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2 text-primary text-xs font-bold">
              <BsCheckCircleFill size={10} />
              <span>AL DÍA</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <h3 className="text-white font-bold text-2xl tracking-tight">
          {data.full_name}
        </h3>
        {data.phone ? (
          <div className="flex items-center gap-2 text-text-color/60 text-sm font-medium">
            <BsTelephone size={12} />
            <span>{data.phone}</span>
          </div>
        ) : (
          <div className="text-text-color/40 text-sm italic">Sin teléfono</div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {data.is_student && (
            <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black tracking-wider uppercase border border-primary/20">
              ALUMNO
            </span>
          )}
          {data.category && (
            <span className="px-3 py-1 rounded-lg bg-white/5 text-text-color/60 text-[10px] font-bold tracking-wider uppercase border border-white/5">
              {data.category}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border-color to-transparent"></div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-text-color/50 uppercase">
            Total Aportado
          </span>
          <span className="text-xl font-black text-primary font-display">
            ${" "}
            {totalContributed.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <button className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-text-color hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-lg cursor-pointer">
          <BsChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
