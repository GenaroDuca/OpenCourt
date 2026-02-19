import { BsSearch } from "react-icons/bs";

export default function PlayersFilter({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
}) {
  return (
    <div className="flex flex-col md:flex-row  md:gap-4 gap-2 justify-between items-center mt-2 md:mt-4 bg-background-card-color p-4 rounded-lg md:rounded-lg border border-border-color">
      {/* Search Input */}
      <div className="relative w-full flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-color/50">
          <BsSearch size={16} />
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-background-color border border-border-color text-text-color placeholder-text-color/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-300 font-light"
          placeholder="Search players by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-between p-1.5 bg-background-color rounded-lg border border-border-color w-full md:w-auto overflow-x-auto gap-2">
        <button
          onClick={() => setFilterType("all")}
          className={`md:px-4 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
            filterType === "all"
              ? "bg-background-card-color text-white shadow-lg"
              : "text-text-color/40 hover:text-text-color/80"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterType("student")}
          className={`md:px-4 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
            filterType === "student"
              ? "bg-background-card-color text-white shadow-lg"
              : "text-text-color/40 hover:text-text-color/80"
          }`}
        >
          Alumnos
        </button>
        <button
          onClick={() => setFilterType("non_student")}
          className={`md:px-4 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
            filterType === "non_student"
              ? "bg-background-card-color text-white shadow-lg"
              : "text-text-color/40 hover:text-text-color/80"
          }`}
        >
          No Alumnos
        </button>
        <button
          onClick={() => setFilterType("pending")}
          className={`md:px-4 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
            filterType === "pending"
              ? "bg-background-card-color text-white shadow-lg"
              : "text-text-color/40 hover:text-text-color/80"
          }`}
        >
          Pendiente
        </button>
        <button
          onClick={() => setFilterType("value")}
          className={`md:px-4 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
            filterType === "value"
              ? "bg-background-card-color text-white shadow-lg"
              : "text-text-color/40 hover:text-text-color/80"
          }`}
        >
          Valor
        </button>
      </div>
    </div>
  );
}
