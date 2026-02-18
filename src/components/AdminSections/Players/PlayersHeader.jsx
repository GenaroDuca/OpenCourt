import { BsPersonFillAdd } from "react-icons/bs";

export default function PlayersHeader({ setIsAddingPlayer }) {
  return (
    <>
      <div className="flex gap-4 justify-between items-center">
        <div className="flex flex-col gap-0 md:gap-1">
          <h1 className="text-xl font-bold text-white md:text-3xl">
            Jugadores
          </h1>
          <p className="text-text-color/70 text-xs md:text-sm">
            Gestiona los jugadores de la plataforma
          </p>
        </div>
        <button
          onClick={() => setIsAddingPlayer(true)}
          className="flex items-center gap-3 px-2 md:px-4 py-1 md:py-3 rounded-lg border cursor-pointer transition-all duration-300 bg-primary/10 text-primary border-border-color hover:bg-primary/15"
        >
          <BsPersonFillAdd size={20} />
          <p className="hidden md:block text-sm">Agregar Jugador</p>
        </button>
      </div>
    </>
  );
}
