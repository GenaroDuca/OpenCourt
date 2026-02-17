import React, { useEffect, useState } from "react";
import { getPlayers } from "../../../services/playerService";
import PlayerCard from "./PlayerCard";

export default function PlayersTable() {
  const [players, setPlayers] = useState([]);
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const players = await getPlayers();
        console.log("Players", players);
        setPlayers(players);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPlayers();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {players.map((player) => (
        <PlayerCard key={player.id} data={player} />
      ))}
    </div>
  );
}
