import React from "react";
import PlayerCard from "./PlayerCard";

export default function PlayersTable({ players, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-64 mt-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mt-2 md:mt-4">
      {players.map((player) => (
        <PlayerCard key={player.id} data={player} />
      ))}
    </div>
  );
}
