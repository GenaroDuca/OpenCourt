import { BsSearch } from "react-icons/bs";

export default function PlayersFilter({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mt-6 bg-background-card-color p-4 rounded-3xl border border-border-color">
      {/* Search Input */}
      <div className="relative w-full flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-color/50">
          <BsSearch size={16} />
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-background-color border border-border-color text-text-color placeholder-text-color/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-300 font-light"
          placeholder="Search players by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex p-1.5 bg-background-color rounded-xl border border-border-color">
        <button
          onClick={() => setFilterType("all")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer ${
            filterType === "all"
              ? "bg-background-card-color text-white shadow-lg"
              : "text-text-color/40 hover:text-text-color/80"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterType("student")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer ${
            filterType === "student"
              ? "bg-background-card-color text-white shadow-lg"
              : "text-text-color/40 hover:text-text-color/80"
          }`}
        >
          Alumnos
        </button>
        <button
          onClick={() => setFilterType("non_student")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer ${
            filterType === "non_student"
              ? "bg-background-card-color text-white shadow-lg"
              : "text-text-color/40 hover:text-text-color/80"
          }`}
        >
          No Alumnos
        </button>
      </div>
    </div>
  );
}
