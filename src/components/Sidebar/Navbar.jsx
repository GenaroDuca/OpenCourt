import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

import { IoIosTennisball } from "react-icons/io";
import { BsPeopleFill } from "react-icons/bs";
import { FaMoneyBills } from "react-icons/fa6";
import { TbLogout } from "react-icons/tb";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

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
      "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-300 ";
    const activeClass = "bg-primary/10 text-primary border-primary/20";
    const inactiveClass =
      "border-transparent text-text-color hover:bg-primary/10 hover:text-primary hover:border-primary/20";
    const logoutClass =
      "flex items-center gap-3 px-4 py-3 rounded-xl border  cursor-pointer transition-all duration-300 text-red-500 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/15 hover:text-red-500 hover:border-red-500/20";

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
    <nav className="h-full flex flex-col justify-between">
      <ul className="flex flex-col gap-4 mt-6">
        <li>
          <Link to="/admin-panel/bookings" className={getLinkClass("bookings")}>
            <IoIosTennisball size={20} />
            <span className="cursor-pointer">Reservas</span>
          </Link>
        </li>
        <li>
          <Link to="/admin-panel/players" className={getLinkClass("players")}>
            <BsPeopleFill size={20} />
            <span className="cursor-pointer">Jugadores</span>
          </Link>
        </li>
        <li>
          <Link to="/admin-panel/payments" className={getLinkClass("payments")}>
            <FaMoneyBills size={20} />
            <span className="cursor-pointer">Pagos</span>
          </Link>
        </li>
      </ul>
      <ul className="flex flex-col gap-1 mt-6">
        <li className={getLinkClass("logout")} onClick={handleLogout}>
          <TbLogout size={20} />
          <span className="cursor-pointer">Cerrar Sesión</span>
        </li>
      </ul>
    </nav>
  );
}
