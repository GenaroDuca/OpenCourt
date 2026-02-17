export default function Header({ title, children }) {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-text-color">{title}</h1>
      <div className="flex items-center gap-4">{children}</div>
    </header>
  );
}
