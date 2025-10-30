import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuGrid from "./components/MenuGrid";
import PromoVideo from "./pages/PromoVideo";
import MapGuide from "./pages/MapGuide";
import Chatbot from "./pages/Chatbot";
import Quiz from "./pages/Quiz";
import QuizCategory from "./pages/QuizCategory";
import QuizResult from "./pages/QuizResult";
import QuizPlay from "./pages/QuizPlay";
import MemoryGame from "./pages/MemoryGame";
import Recommendation from "./pages/Recommendation";
import AlertSystem from "./pages/AlertSystem";
import MainPage from "./photobooth/MainPage";
import SelectPage from "./photobooth/SelectPage";
import PhotoBooth from "./pages/PhotoBooth";


function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Routes>
          <Route path="/" element={<MenuGrid />} />
          <Route path="/promo" element={<PromoVideo />} />
          <Route path="/map" element={<MapGuide />} />

          <Route path="/photo" element={<MainPage />} />
          <Route path="/select" element={<SelectPage />} />
          <Route path="/booth" element={<PhotoBooth />} />

          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/QuizCategory" element={<QuizCategory />} />
          <Route path="/quiz/play" element={<QuizPlay />} />
          <Route path="/quiz/Result" element={<QuizResult />} />
          <Route path="/memory" element={<MemoryGame />} />
          <Route path="/recommend" element={<Recommendation />} />
          <Route path="/alert" element={<AlertSystem />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
