import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  BsCalendar3,
  BsChevronLeft,
  BsChevronRight,
  BsPlus,
} from "react-icons/bs";
import BookingCalendar from "./BookingCalendar";
import NewBookingModal from "./NewBookingModal";
import {
  getBookingsByDate,
  getCourts,
  getPriceConfig,
} from "../../../services/bookingService";
import { getPlayers } from "../../../services/playerService";

export default function Bookings() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedDate, setSelectedDate] = useState(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [priceConfig, setPriceConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  // Sync URL with selected date
  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    // Only update if different to avoid infinite loops
    if (searchParams.get("date") !== dateStr) {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("date", dateStr);
          return newParams;
        },
        { replace: false },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Sync state with URL changes (e.g. back button)
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);
      // Create date at midnight local time
      const newDate = new Date(year, month - 1, day);

      // Check if date is valid and different
      if (
        !isNaN(newDate.getTime()) &&
        (newDate.getFullYear() !== selectedDate.getFullYear() ||
          newDate.getMonth() !== selectedDate.getMonth() ||
          newDate.getDate() !== selectedDate.getDate())
      ) {
        setSelectedDate(newDate);
      }
    }
  }, [searchParams]);

  // Sync modal with URL bookingId
  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (bookingId && bookings.length > 0) {
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) {
        setEditingBooking(booking);
        setIsModalOpen(true);
      }
    } else if (!bookingId) {
      // If URL param removed, ensuring modal closes is optional but might be good
      // But usually we close modal -> remove param.
    }
  }, [searchParams, bookings]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, courtsData, priceData, playersData] =
        await Promise.all([
          getBookingsByDate(selectedDate),
          getCourts(),
          getPriceConfig(),
          getPlayers(),
        ]);
      setBookings(bookingsData);
      setCourts(courtsData);
      setPriceConfig(priceData);
      setPlayers(playersData);
    } catch (error) {
      console.error("Error loading booking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handlePrevDay = () => {
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

  const [initialCourtId, setInitialCourtId] = useState("");
  const [initialTime, setInitialTime] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);

  const handleSlotClick = (courtId, time) => {
    setInitialCourtId(courtId);
    setInitialTime(time);
    setEditingBooking(null);
    setIsModalOpen(true);
  };

  const handleBookingClick = (booking) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("bookingId", booking.id);
        return newParams;
      },
      { replace: false },
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInitialCourtId(""); // Reset
    setInitialTime("");
    setEditingBooking(null);
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("bookingId");
        return newParams;
      },
      { replace: false },
    );
  };

  return (
    <div className="flex flex-col gap-2 md:gap-4 relative">
      {/* Header */}
      <div className="sticky top-0 z-20 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 bg-background-color/80 backdrop-blur-sm w-full py-2 border-b border-white/5">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2 bg-background-color p-1 rounded-lg border border-border-color">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-white/5 rounded-lg text-text-color transition-colors cursor-pointer"
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

          {/* Mobile Add Booking Button */}
          <button
            onClick={() => {
              setEditingBooking(null);
              setIsModalOpen(true);
            }}
            className="flex md:hidden items-center p-2 rounded-lg border cursor-pointer transition-all duration-300 flex-col md:flex-row text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30"
          >
            <BsPlus size={20} />
          </button>
        </div>

        <div className="text-sm md:text-xl font-bold text-white capitalize">
          {formatDate(selectedDate)}
        </div>

        {/* Desktop Add Booking Button */}
        <button
          onClick={() => {
            setEditingBooking(null);
            setIsModalOpen(true);
          }}
          className="md:h-[50px] hidden md:flex items-center gap-3 px-2 md:px-4 py-1 md:py-3 rounded-lg border cursor-pointer transition-all duration-300 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30"
        >
          <BsPlus size={20} />
          <span className="hidden md:block text-sm">Nueva Reserva</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="min-h-0">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <BookingCalendar
            bookings={bookings}
            courts={courts}
            selectedDate={selectedDate}
            onSlotClick={handleSlotClick}
            onBookingClick={handleBookingClick}
            highlightedBookingId={searchParams.get("bookingId")}
          />
        )}
      </div>

      <NewBookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBookingAdded={loadData}
        courts={courts}
        priceConfig={priceConfig}
        players={players}
        initialDate={selectedDate}
        initialCourtId={initialCourtId}
        initialTime={initialTime}
        bookings={bookings}
        bookingToEdit={editingBooking}
      />
    </div>
  );
}
