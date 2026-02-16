import { useState } from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { Bookings } from "../components/AdminSections/Bookings";
import Players from "../components/AdminSections/Players";
import Payments from "../components/AdminSections/Payments";
import Settings from "../components/AdminSections/Settings";

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("bookings");

  const renderSection = () => {
    switch (activeSection) {
      case "bookings":
        return <Bookings />;
      case "players":
        return <Players />;
      case "payments":
        return <Payments />;
      case "settings":
        return <Settings />;
      default:
        return <Bookings />;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-dark-b overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {renderSection()}
          </main>
        </div>
      </div>
    </>
  );
}
