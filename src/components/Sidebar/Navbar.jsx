import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

import { IoIosTennisball } from "react-icons/io";
import { BsPeopleFill } from "react-icons/bs";
import { FaMoneyBills } from "react-icons/fa6";
import { TbLogout } from "react-icons/tb";

export default function Navbar({ activeSection, setActiveSection }) {
  const navigate = useNavigate();
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

  const getLinkClass = (sectionName) => {
    const baseClass =
      "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-300";
    const activeClass = "bg-primary/10 text-primary border-primary/20";
    const inactiveClass =
      "border-transparent text-text-color hover:bg-primary/10 hover:text-primary hover:border-primary/20";
    const logoutClass =
      "border-transparent text-text-color hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20";

    return `${baseClass} ${
      activeSection === sectionName
        ? activeClass
        : sectionName === "logout"
          ? logoutClass
          : inactiveClass
    }`;
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    navigate("/login");
    toast.success("¡Sesión cerrada exitosamente!");
  };

  return (
    <nav className="h-full flex flex-col justify-between">
      <ul className="flex flex-col gap-4 mt-6">
        <li
          className={getLinkClass("bookings")}
          onClick={() => setActiveSection("bookings")}
        >
          <IoIosTennisball size={20} />
          <button className="cursor-pointer">Reservas</button>
        </li>
        <li
          className={getLinkClass("players")}
          onClick={() => setActiveSection("players")}
        >
          <BsPeopleFill size={20} />
          <button className="cursor-pointer">Jugadores</button>
        </li>
        <li
          className={getLinkClass("payments")}
          onClick={() => setActiveSection("payments")}
        >
          <FaMoneyBills size={20} />
          <button className="cursor-pointer">Pagos</button>
        </li>
      </ul>
      <ul className="flex flex-col gap-1 mt-6">
        <li className={getLinkClass("logout")} onClick={() => handleLogout()}>
          <TbLogout size={20} />
          <button className="cursor-pointer">Cerrar Sesión</button>
        </li>
      </ul>
    </nav>
  );
}
