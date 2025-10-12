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
import { auth, db } from "./firebase"; // firebase.js에서 export된 auth, db 불러오기

// ✅ Firebase Auth 기능 가져오기
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
} from "firebase/auth";

// ✅ 페이지 컴포넌트
import MapPage from "./pages/MapPage";
import CommunityPage from "./pages/CommunityPage";
import MarketPage from "./pages/MarketPage";
import LoginPage from "./pages/LoginPage";

function Header({ user, handleLogout }) {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1
        onClick={() => navigate("/")}
        className="text-2xl font-bold text-blue-700 cursor-pointer flex items-center"
      >
        <img
          src="https://placehold.co/32x32/003C9E/ffffff?text=I%26T"
          alt="logo"
          className="w-8 h-8 mr-2 rounded-full"
        />
        인하공전 캠퍼스 플랫폼
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

function App() {
  const [user, setUser] = useState(null);

 useEffect(() => {
  // Firebase 인증 상태 변화 감지
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("로그인된 사용자:", user.uid);
      setUser(user); // ✅ 로그인된 사용자 상태 저장
    } else {
      console.log("로그인 안됨");
      setUser(null); // ✅ 로그아웃 시 상태 초기화
    }
  });

  // 컴포넌트가 언마운트될 때 리스너 해제
  return () => unsubscribe();
}, []);

  const handleLogin = async () => {
    await signInAnonymously(auth);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <Router>
      <Header user={user} handleLogout={handleLogout} />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/community" element={<CommunityPage user={user} />} />
          <Route path="/market" element={<MarketPage user={user} />} />
          <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
