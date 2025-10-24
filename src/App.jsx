import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuGrid from "./components/MenuGrid";
import PromoVideo from "./pages/PromoVideo";
import MapGuide from "./pages/MapGuide";
import PhotoBooth from "./pages/PhotoBooth";
import Chatbot from "./pages/Chatbot";
import Quiz from "./pages/Quiz";
import MemoryGame from "./pages/MemoryGame";
import Recommendation from "./pages/Recommendation";
import AlertSystem from "./pages/AlertSystem";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Routes>
          <Route path="/" element={<MenuGrid />} />
          <Route path="/promo" element={<PromoVideo />} />
          <Route path="/map" element={<MapGuide />} />
          <Route path="/photo" element={<PhotoBooth />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/memory" element={<MemoryGame />} />
          <Route path="/recommend" element={<Recommendation />} />
          <Route path="/alert" element={<AlertSystem />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
