import logo from "../../../public/OpenCourt.png";

export default function Brand() {
  return (
    <div className="text-center items-center hidden md:flex flex-col">
      <img src={logo} alt="Logo" className="w-35 h-auto" />
    </div>
  );
}
