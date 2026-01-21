import { Header } from "./components/Header";
import { Dashboard } from "./pages/Dashboard";

export default function App() {
  return (
    <div>
      <Header />
      <div className="max-w-5xl m-auto">
        <Dashboard />
      </div>
    </div>
  );
}
