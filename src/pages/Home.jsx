import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BsCalendar3,
  BsChevronLeft,
  BsChevronRight,
  BsWhatsapp,
} from "react-icons/bs";
import BookingCalendar from "../components/AdminSections/Bookings/BookingCalendar";
import { getBookingsByDate, getCourts } from "../services/bookingService";
import { getBlockoutsByDate } from "../services/blockoutService";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedDate, setSelectedDate] = useState(() => {
    const dateParam = searchParams.get("date");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);
      const paramDate = new Date(year, month - 1, day);
      paramDate.setHours(0, 0, 0, 0);

      // If param date is in the past, return today
      if (paramDate < today) return today;
      return paramDate;
    }
    return today;
  });
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync URL with selected date
  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    if (searchParams.get("date") !== dateStr) {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("date", dateStr);
          return newParams;
        },
        { replace: true },
      );
    }
  }, [selectedDate, searchParams, setSearchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, blockoutsData, courtsData] = await Promise.all([
        getBookingsByDate(selectedDate),
        getBlockoutsByDate(selectedDate),
        getCourts(),
      ]);

      // Normalize blockouts to look like bookings for the calendar
      const formattedBlockouts = blockoutsData.map((b) => ({
        id: b.id,
        court_id: b.court_id,
        start_time: b.start_time,
        end_time: b.end_time,
        details: b.reason,
        is_fixed: b.is_recurring,
        booking_players: [],
        is_blockout: true,
      }));

      setBookings([...bookingsData, ...formattedBlockouts]);
      setCourts(courtsData);
    } catch (error) {
      console.error("Error loading booking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const isToday = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const handlePrevDay = () => {
    if (isToday()) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background-color text-text-color p-2 md:p-4">
      <div className="flex flex-col gap-2 md:gap-4 relative">
        {/* Header - Identical to Admin Bookings Style */}
        <div className="z-20 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 bg-background-color/80 backdrop-blur-sm w-full pb-2 border-b border-white/5">
          <div className="flex items-center">
            <h1 className="text-xl font-black text-white tracking-tighter">
              Ferro<span className="text-blue-400"> Turnos</span>
            </h1>
          </div>
          <div className="flex items-center justify-between gap-2 md:gap-4 :w-auto">
            <div className="flex items-center gap-2 bg-background-color p-1 rounded-2xl md:rounded-lg border border-border-color">
              <button
                onClick={handlePrevDay}
                disabled={isToday()}
                className={`p-2 rounded-lg text-text-color transition-colors ${
                  isToday()
                    ? "opacity-20 cursor-not-allowed"
                    : "hover:bg-white/5 cursor-pointer"
                }`}
              >
                <BsChevronLeft />
              </button>
              <div className="flex items-center gap-2  min-w-[100px] text-sm md:text-base md:min-w-[180px] justify-center text-white font-medium">
                <BsCalendar3 className="text-primary" />
                <span>{selectedDate.toLocaleDateString()}</span>
              </div>
              <button
                onClick={handleNextDay}
                className="p-2 hover:bg-white/5 rounded-lg text-text-color transition-colors cursor-pointer"
              >
                <BsChevronRight />
              </button>
            </div>
            <button
              onClick={handleToday}
              className="px-2 py-2 text-sm  font-bold text-text-color hover:text-white transition-colors cursor-pointer"
            >
              Hoy
            </button>
          </div>

          <div className="flex-col-reverse md:flex-row flex items-center gap-2 md:gap-6">
            <div className="text-sm md:text-lg font-bold text-white capitalize">
              {formatDate(selectedDate)}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="min-h-0">
          {loading ? (
            <div className="w-full h-[500px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <BookingCalendar
              bookings={bookings}
              courts={courts}
              selectedDate={selectedDate}
              onSlotClick={() => {}}
              onBookingClick={() => {}}
              readOnly={true}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 py-4 px-2 text-[10px] font-bold uppercase tracking-widest text-text-color/40 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary/20 border border-primary/40"></div>
            <span>Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-white/10 border border-white/20"></div>
            <span>Ocupado</span>
          </div>
        </div>

        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.link/1v9q75"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-50 hover:bg-[#25D366]/80 cursor-pointer"
          title="Contactar por WhatsApp"
        >
          <BsWhatsapp size={isMobile ? 28 : 32} />
        </a>
      </div>
    </div>
  );
}
