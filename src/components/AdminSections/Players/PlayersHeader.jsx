import { BsPersonFillAdd } from "react-icons/bs";

export default function PlayersHeader({ setIsAddingPlayer }) {
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white">Jugadores</h1>
          <p className="text-text-color/70">
            Gestiona los jugadores de la plataforma
          </p>
        </div>
        <button onClick={() => setIsAddingPlayer(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-300 bg-primary/10 text-primary border-border-color hover:bg-primary/15">
          <BsPersonFillAdd size={20} />
          <p className="hidden md:block">Agregar Jugador</p>
        </button>
      </div>
    </>
  );
}
