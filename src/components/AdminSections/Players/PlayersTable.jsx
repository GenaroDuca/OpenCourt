import React from "react";
import PlayerCard from "./PlayerCard";

const PlayerCardSkeleton = () => (
  <div className="bg-background-card-color border border-border-color p-6 rounded-[2rem] flex flex-col gap-6 animate-pulse h-[280px]">
    <div className="flex justify-between items-start">
      <div className="w-16 h-16 rounded-full bg-white/5"></div>
      <div className="flex flex-col items-end gap-2">
        <div className="w-12 h-3 bg-white/5 rounded"></div>
        <div className="w-24 h-6 bg-white/5 rounded-lg"></div>
      </div>
    </div>
    <div className="flex flex-col gap-3 mt-2">
      <div className="w-3/4 h-8 bg-white/5 rounded-lg"></div>
      <div className="w-1/2 h-4 bg-white/5 rounded"></div>
      <div className="flex gap-2 mt-2">
        <div className="w-20 h-6 bg-white/5 rounded-lg"></div>
        <div className="w-20 h-6 bg-white/5 rounded-lg"></div>
      </div>
    </div>
    <div className="mt-auto flex justify-between items-center">
      <div className="flex flex-col gap-2">
        <div className="w-24 h-3 bg-white/5 rounded"></div>
        <div className="w-32 h-6 bg-white/5 rounded"></div>
      </div>
      <div className="w-10 h-10 rounded-xl bg-white/5"></div>
    </div>
  </div>
);

export default function PlayersTable({ players, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {[...Array(8)].map((_, index) => (
          <PlayerCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {players.map((player) => (
        <PlayerCard key={player.id} data={player} />
      ))}
    </div>
  );
}
