import { useState, useEffect } from "react";
import PlayersHeader from "./PlayersHeader";
import NewPlayerForm from "./NewPlayerForm";
import PlayersTable from "./PlayersTable.jsx";
import { StatsCard } from "../StatsCard";
import { BsPerson } from "react-icons/bs";
import { FaGraduationCap } from "react-icons/fa";
import { MdGroups2 } from "react-icons/md";
import { TiWarning } from "react-icons/ti";
import { getPlayers } from "../../../services/playerService";
import PlayersFilter from "./PlayersFilter";

export default function Players() {
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const fetchPlayers = async () => {
    try {
      const data = await getPlayers();
      setPlayers(data);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const totalPlayers = players.length;
  const totalStudents = players.filter((p) => p.is_student).length;
  const totalNonStudents = players.filter((p) => !p.is_student).length;

  // Helper to check if a booking player has actionable debt (strictly past, excluding today)
  const hasActionableDebt = (player) => {
    if (!player.booking_players) return false;
    return player.booking_players.some((bp) => {
      // Must be unpaid
      if (bp.is_paid) return false;

      const startTime = bp.bookings?.start_time;
      if (!startTime) return false;

      const bookingTime = new Date(startTime);
      const nowIdx = new Date();
      // Reset times to compare strictly dates
      const bookingDay = new Date(
        bookingTime.getFullYear(),
        bookingTime.getMonth(),
        bookingTime.getDate(),
      );
      const currentDay = new Date(
        nowIdx.getFullYear(),
        nowIdx.getMonth(),
        nowIdx.getDate(),
      );

      // If future OR TODAY, not debt yet (since it is paid 'on the day')
      if (bookingDay.getTime() >= currentDay.getTime()) {
        return false;
      }
      return true;
    });
  };

  // Calculate ALL players who have pending payments (debt)
  const playersWithDebt = players.filter((p) => hasActionableDebt(p)).length;

  const filteredPlayers = players
    .filter((player) => {
      const matchesSearch =
        player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (player.phone && player.phone.includes(searchTerm));

      if (filterType === "student") return matchesSearch && player.is_student;
      if (filterType === "non_student")
        return matchesSearch && !player.is_student;

      if (filterType === "pending") {
        // Show ANY player with debt
        const hasDebt = hasActionableDebt(player);
        return matchesSearch && hasDebt;
      }

      return matchesSearch;
    })
    .sort((a, b) => {
      if (filterType === "value") {
        // "Valor" logic: Sort by Total Paid Amount (Descending)
        const getPlayerTotal = (p) => {
          if (!p.booking_players) return 0;
          return p.booking_players.reduce((sum, bp) => {
            // Only count if marked as paid
            if (bp.is_paid) {
              return sum + Number(bp.individual_price || 0);
            }
            return sum;
          }, 0);
        };

        return getPlayerTotal(b) - getPlayerTotal(a);
      }
      return 0;
    });

  return (
    <>
      <NewPlayerForm
        isOpen={isAddingPlayer}
        onClose={() => setIsAddingPlayer(false)}
        onPlayerAdded={fetchPlayers}
      />
      <PlayersHeader setIsAddingPlayer={setIsAddingPlayer} />
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mt-4 md:mt-4">
        <StatsCard
          title="Total de Jugadores"
          value={totalPlayers}
          icon={<MdGroups2 size={24} />}
          color="purple"
          isActive={filterType === "all"}
          onClick={() => setFilterType("all")}
        />
        <StatsCard
          title="Total de Alumnos"
          value={totalStudents}
          icon={<FaGraduationCap size={24} />}
          color="green"
          isActive={filterType === "student"}
          onClick={() =>
            setFilterType(filterType === "student" ? "all" : "student")
          }
        />
        <StatsCard
          title="Total de No Alumnos"
          value={totalNonStudents}
          icon={<BsPerson size={24} />}
          color="blue"
          isActive={filterType === "non_student"}
          onClick={() =>
            setFilterType(filterType === "non_student" ? "all" : "non_student")
          }
        />

        <StatsCard
          title="Jugadores que deben"
          value={playersWithDebt}
          icon={<TiWarning size={24} />}
          color="yellow"
          isActive={filterType === "pending"}
          onClick={() =>
            setFilterType(filterType === "pending" ? "all" : "pending")
          }
        />
      </div>
      <PlayersFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      <PlayersTable players={filteredPlayers} loading={loading} />
    </>
  );
}
