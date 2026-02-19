import { BsPlus } from "react-icons/bs";
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
          className="flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all duration-300 bg-primary/10 text-primary border-border-color hover:bg-primary/15"
        >
          <BsPlus size={20} />
          <p className="hidden md:block text-sm">Agregar Jugador</p>
        </button>
      </div>
    </>
  );
}
