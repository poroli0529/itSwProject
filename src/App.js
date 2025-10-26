// src/App.js
import "./index.css";
import React, { useEffect, useState } from "react";

// ✅ Router 관련 (라우팅)
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

// ✅ Firebase 설정 가져오기
// REST API 기반 인증 클라이언트
import { getCurrentUser, login, logout as apiLogout } from "./api/auth";
import SignupPage from "./pages/SignupPage";

// ✅ 페이지 컴포넌트
import MapPage from "./pages/MapPage";
import CommunityPage from "./pages/CommunityPage";
import CommunityDetail from "./pages/CommunityDetail";
import CommunityWrite from "./pages/CommunityWrite";
import MarketPage from "./pages/MarketPage";
import MarketWrite from "./pages/MarketWrite";
import LoginPage from "./pages/LoginPage";

// ✅ 로고 이미지
import title from "./images/title.png";
function Header({ user, handleLogout }) {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1
        onClick={() => navigate("/")}
        className="text-2xl font-bold text-blue-700 cursor-pointer flex items-center"
      >
      
        <img src={title} alt="Title" className="h-8 w-auto" />
      </h1>
      <nav className="flex items-center space-x-4">
        <Link to="/">지도</Link>
        <Link to="/community">커뮤니티</Link>
        <Link to="/market">중고거래</Link>
        {user ? (
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            로그아웃
          </button>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
}
// ㅁㄴㅇㅁㄴㅇㅁㄴㅇㅁㄴㅇ 이거 왜이런

function App() {
  const [user, setUser] = useState(null);

 useEffect(() => {
  // 서버의 세션/토큰 상태로부터 현재 사용자 정보 조회
  let mounted = true;
  (async () => {
    try {
      const u = await getCurrentUser();
      if (!mounted) return;
      if (u) {
        console.log("로그인된 사용자 (서버):", u);
        setUser(u);
      } else {
        console.log("로그인 안됨 (서버)");
        setUser(null);
      }
    } catch (e) {
      console.error("getCurrentUser 오류:", e);
      setUser(null);
    }
  })();

  return () => {
    mounted = false;
  };
}, []);

  const handleLogin = async (credentials) => {
    // credentials: { id, password }
    try {
      const u = await login(credentials);
      setUser(u);
      return u;
    } catch (e) {
      console.error("로그인 실패:", e);
      throw e;
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.warn("서버 로그아웃 실패 (무시):", e);
    }
    setUser(null);
  };

  return (
    <Router>
      <Header user={user} handleLogout={handleLogout} />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/community" element={<CommunityPage user={user} />} />
          <Route path="/community/new" element={<CommunityWrite />} />
          <Route path="/community/edit/:id" element={<CommunityWrite />} />
          <Route path="/community/view/:id" element={<CommunityDetail user={user} />} />
          <Route path="/market" element={<MarketPage user={user} />} />
          <Route path="/market/new" element={<MarketWrite />} />
          <Route path="/market/edit/:id" element={<MarketWrite />} />
          <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </main>
    </Router>
  );
}
// asdasd
export default App;
