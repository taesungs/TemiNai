import { useNavigate } from "react-router-dom";

import promoVideoIcon from "../assets/promovideo.png";
import mapIcon from "../assets/map.png";
import photoIcon from "../assets/photobooth.png";
import chatbotIcon from "../assets/chatbot.png";
import quizIcon from "../assets/quiz.png";
import memoryIcon from "../assets/memory.png";
import recommendIcon from "../assets/recommend.png";
import alertIcon from "../assets/alert.png";

const menuItems = [
  { title: "홍보 영상", icon: promoVideoIcon, path: "/promo" },
  { title: "길 안내", icon: mapIcon, path: "/map" },
  { title: "테미 네컷", icon: photoIcon, path: "/photo" },
  { title: "챗봇", icon: chatbotIcon, path: "/chatbot" },
  { title: "O/X 퀴즈", icon: quizIcon, path: "/quiz" },
  { title: "메모리 게임", icon: memoryIcon, path: "/memory" },
  { title: "맛집/관광지 추천", icon: recommendIcon, path: "/recommend" },
  { title: "경비 시스템", icon: alertIcon, path: "/alert" },
];

export default function MenuGrid() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* 상단 그리드 영역 */}
      <div className="flex flex-1 items-center justify-center">
          <div className="grid grid-cols-4 gap-20 w-[90vw] max-w-[1600px] p-12">
              {menuItems.map((item) => (
                  <div
                      key={item.title}
                      onClick={() => navigate(item.path)}
                      className="aspect-square flex flex-col items-center justify-center border-2 border-gray-500 rounded-lg bg-white shadow-sm hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
                  >
                      <img
                          src={item.icon}
                          alt={item.title}
                          className="w-40 h-40 object-contain mb-4"
                      />
                      <p className="text-gray-700 text-xl font-medium">{item.title}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* 화면 맨 아래 고정 멘트 */}
      <div className="w-full text-center py-6 text-gray-500 text-lg">
        본 서비스는 We-Met 수업 프로젝트 결과물로 제작되었습니다.
      </div>

    </div>
  );
}
