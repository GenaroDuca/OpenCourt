import Navbar from "./Navbar";
import Brand from "./Brand";

export default function Sidebar() {
  return (
    <aside className="w-full md:w-64 bg-background-card-color flex flex-col p-2 md:p-4">
      <Brand />
      <Navbar />
    </aside>
  );
}
