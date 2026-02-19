import { BsPlus } from "react-icons/bs";
export default function PlayersHeader({ setIsAddingPlayer }) {
  return (
    <>
      <div className="flex gap-4 justify-between items-center">
        <div className="flex flex-col gap-0">
          <h1 className="text-xl font-bold text-white md:text-3xl">
            Jugadores
          </h1>
          <p className="text-text-color/70 text-xs md:text-sm">
            Gestiona los jugadores de la plataforma
          </p>
        </div>
        <button
          onClick={() => setIsAddingPlayer(true)}
          className="md:h-[50px] flex items-center md:px-4 md:py-3 p-2 gap-3 rounded-lg border cursor-pointer transition-all duration-300 flex-col md:flex-row text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30"
        >
          <BsPlus size={20} />
          <p className="hidden md:block text-sm">Agregar Jugador</p>
        </button>
      </div>
    </>
  );
}
