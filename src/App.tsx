import MainFrame from "./components/layout/MainFrame";

const App: React.FC = () => {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #1f2937 0%, #020617 100%)",
        color: "#e5e7eb",
      }}
    >
      <MainFrame />
    </div>
  );
};

export default App;