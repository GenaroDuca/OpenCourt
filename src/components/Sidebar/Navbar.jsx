import { IoIosTennisball } from "react-icons/io";
import { BsPeopleFill } from "react-icons/bs";
import { FaMoneyBills } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";

export default function Navbar({ activeSection, setActiveSection }) {
  const getLinkClass = (sectionName) => {
    const baseClass =
      "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-300";
    const activeClass = "bg-primary/10 text-primary border-primary/20";
    const inactiveClass =
      "border-transparent text-text-color hover:bg-primary/10 hover:text-primary hover:border-primary/20";

    return `${baseClass} ${
      activeSection === sectionName ? activeClass : inactiveClass
    }`;
  };

  return (
    <nav>
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
        <li
          className={getLinkClass("settings")}
          onClick={() => setActiveSection("settings")}
        >
          <IoMdSettings size={20} />
          <button className="cursor-pointer">Configuración</button>
        </li>
      </ul>
    </nav>
  );
}
