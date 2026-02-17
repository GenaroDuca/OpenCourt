import Navbar from "./Navbar";
import Brand from "./Brand";

export default function Sidebar({ activeSection, setActiveSection }) {
  return (
    <aside className="w-64 bg-background-card-color flex flex-col p-4">
      <Brand />
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </aside>
  );
}
