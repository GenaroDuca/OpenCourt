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

  useEffect(() => {
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
    fetchPlayers();
  }, []);

  const totalPlayers = players.length;
  const totalStudents = players.filter((p) => p.is_student).length;
  const totalNonStudents = players.filter((p) => !p.is_student).length;

  // Calculate students who have pending payments (debt)
  const studentsWithDebt = players.filter(
    (p) =>
      p.is_student &&
      p.booking_players &&
      p.booking_players.some((booking) => !booking.is_paid),
  ).length;

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.phone && player.phone.includes(searchTerm));

    if (filterType === "student") return matchesSearch && player.is_student;
    if (filterType === "non_student")
      return matchesSearch && !player.is_student;

    return matchesSearch;
  });

  return (
    <>
      <NewPlayerForm
        isOpen={isAddingPlayer}
        onClose={() => setIsAddingPlayer(false)}
      />
      <PlayersHeader setIsAddingPlayer={setIsAddingPlayer} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatsCard
          title="Total de Alumnos"
          value={totalStudents}
          icon={<FaGraduationCap size={24} />}
          color="green"
        />
        <StatsCard
          title="Total de No Alumnos"
          value={totalNonStudents}
          icon={<BsPerson size={24} />}
          color="blue"
        />
        <StatsCard
          title="Total de Jugadores"
          value={totalPlayers}
          icon={<MdGroups2 size={24} />}
          color="purple"
        />
        <StatsCard
          title="Alumnos que deben pagar"
          value={studentsWithDebt}
          icon={<TiWarning size={24} />}
          color="yellow"
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
