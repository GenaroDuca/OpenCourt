import { BsSearch } from "react-icons/bs";

export default function PlayersFilter({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
}) {
  return (
    <div className="flex flex-row  md:gap-4 gap-2 justify-between items-center mt-2 md:mt-4 bg-background-card-color p-2 md:p-4 rounded-2xl md:rounded-lg border border-border-color">
      {/* Search Input */}
      <div className="relative w-full flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-color/50">
          <BsSearch size={16} />
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-4 py-2 rounded-2xl md:rounded-lg bg-background-color border border-border-color text-text-color placeholder-text-color/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-300"
          placeholder="Buscar jugador, nombre, teléfono o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-between  p-2 bg-background-color rounded-2xl md:rounded-lg border border-border-color w-auto overflow-x-auto gap-2">
        <button
          onClick={() =>
            setFilterType(filterType === "value" ? "all" : "value")
          }
          className={`rounded-2xl md:rounded-lg px-4 py-1 text-sm font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
            filterType === "value"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-text-color/60 hover:text-text-color/80"
          }`}
        >
          Valor
        </button>
      </div>
    </div>
  );
}
