import PlayersHeader from "./PlayersHeader";
import NewPlayerForm from "./NewPlayerForm";
import { useState } from "react";
import PlayersTable from "./PlayersTable.jsx";

export default function Players() {
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  return (
    <>
      <NewPlayerForm
        isOpen={isAddingPlayer}
        onClose={() => setIsAddingPlayer(false)}
      />
      <PlayersHeader setIsAddingPlayer={setIsAddingPlayer} />
      <PlayersTable />
    </>
  );
}
