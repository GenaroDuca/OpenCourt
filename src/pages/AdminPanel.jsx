import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import Bookings from "../components/AdminSections/Bookings/Bookings";
import Players from "../components/AdminSections/Players/Players";
import PlayerDetails from "../components/AdminSections/Players/PlayerDetails";
import Payments from "../components/AdminSections/Payments/Payments";

export default function AdminPanel() {
  return (
    <>
      <div className="flex h-screen bg-dark-b overflow-hidden md:flex-row flex-col">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <Routes>
              <Route path="bookings" element={<Bookings />} />
              <Route path="players" element={<Players />} />
              <Route path="players/:id" element={<PlayerDetails />} />
              <Route path="payments" element={<Payments />} />
              <Route path="*" element={<Navigate to="bookings" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}
