import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { getMonthlyRevenue } from "../../services/bookingService";
import toast from "react-hot-toast";

import { IoIosTennisball } from "react-icons/io";
import { BsPeopleFill, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { FaMoneyBills } from "react-icons/fa6";
import { TbLogout } from "react-icons/tb";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState({
    total: 0,
    efectivo: 0,
    transferencia: 0,
  });

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
    getMonthlyRevenue(selectedDate).then(setMonthlyStats).catch(console.error);
  }, [location.pathname, selectedDate]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const getLinkClass = (sectionName) => {
    const baseClass =
      "md:h-[50px] flex items-center md:gap-3 px-2 md:px-4 py-1 md:py-3 rounded-lg border cursor-pointer transition-all duration-300 flex-col md:flex-row text-sm";
    const activeClass = "bg-primary/10 text-primary border-primary/20";
    const inactiveClass =
      "border-transparent text-text-color hover:bg-primary/10 hover:text-primary hover:border-primary/20";
    const logoutClass =
      "flex items-center md:gap-3 px-2 md:px-4 py-1 md:py-3 rounded-lg md:border cursor-pointer transition-all duration-300 text-red-500 md:bg-red-500/10 text-red-500 md:border-red-500/20 md:hover:bg-red-500/15 md:hover:text-red-500 md:hover:border-red-500/20";

    if (sectionName === "logout") return logoutClass;

    return `${baseClass} ${
      isActive(sectionName) ? activeClass : inactiveClass
    }`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    toast.success("¡Sesión cerrada exitosamente!");
  };

  return (
    <nav className="h-full flex md:flex-col justify-between items-center">
      <ul className="flex md:flex-col gap-2 md:gap-4 md:mt-4 md:w-full w-auto">
        <li>
          <Link to="/admin/bookings" className={getLinkClass("bookings")}>
            <IoIosTennisball size={20} className="hidden md:block" />
            <span className="cursor-pointer">Reservas</span>
          </Link>
        </li>
        <li>
          <Link to="/admin/players" className={getLinkClass("players")}>
            <BsPeopleFill size={20} className="hidden md:block" />
            <span className="cursor-pointer">Jugadores</span>
          </Link>
        </li>
        <li>
          <Link to="/admin/payments" className={getLinkClass("payments")}>
            <FaMoneyBills size={20} className="hidden md:block" />
            <span className="cursor-pointer">Pagos</span>
          </Link>
        </li>
      </ul>
      <ul className="flex flex-col gap-2 md:gap-4 md:mt-4 md:w-full w-auto">
        {/* Monthly Revenue Card */}
        <li className="hidden md:block w-full">
          <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-lg border border-white/10 w-full">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white/10 text-text-color/50 hover:text-white transition-colors rounded-lg cursor-pointer"
              >
                <BsChevronLeft size={12} />
              </button>
              <h3 className="text-[10px] font-bold text-text-color/50 uppercase tracking-wider">
                Recaudado{" "}
                {selectedDate.toLocaleString("es-AR", { month: "long" })}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-1  hover:bg-white/10 text-text-color/50 hover:text-white transition-colors rounded-lg cursor-pointer"
              >
                <BsChevronRight size={12} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-text-color text-sm">Efectivo</span>
                <span className="text-text-color font-bold">
                  ${monthlyStats.efectivo.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-color text-sm">Transferencia</span>
                <span className="text-text-color font-bold">
                  ${monthlyStats.transferencia.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-white/10 my-1"></div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-white">Total</span>
                <span className="text-text-color text-sm">
                  ${monthlyStats.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </li>
        <li className={getLinkClass("logout")} onClick={handleLogout}>
          <TbLogout size={20} />
          <span className="cursor-pointer hidden md:block">Cerrar Sesión</span>
        </li>
      </ul>
    </nav>
  );
}
