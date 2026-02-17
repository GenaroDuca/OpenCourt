import logo from "../../../public/OpenCourt.png";

export default function Brand() {
  return (
    <div className="text-center items-center gap-2 hidden md:flex">
      <img src={logo} alt="Logo" className="w-16 h-16" />
      <div>
        <h1 className="text-2xl font-bold text-left text-white">OpenCourt</h1>
        <p className="text-sm text-text-dark-mode text-gray-500">
          Panel Administrativo
        </p>
      </div>
    </div>
  );
}
