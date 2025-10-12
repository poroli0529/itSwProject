// src/App.js
import "./index.css";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

// 아이콘 (Tailwind 그대로 유지)
const MapIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const CommunityIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 17h2v-5h-1V3H4v14h2"/><path d="M12 21h3"/><path d="M16 21v-3"/><path d="M8 21h3"/><path d="M7 17v-1.5h11.3V17"/>
  </svg>
);
const MarketIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 3v12a6 6 0 0 0 12 0V3"/><path d="M12 6v6m0-6h6m-6 0H6"/>
  </svg>
);

// --- 페이지들 ---
function MapPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-4">🏫 인하공전 캠퍼스 지도</h1>
      <p className="text-gray-600">여기에 지도 API를 연동할 수 있습니다.</p>
    </div>
  );
}

function CommunityPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-4">💬 커뮤니티 게시판</h1>
      <p className="text-gray-600">로그인 후 게시글을 작성할 수 있습니다.</p>
    </div>
  );
}

function MarketPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-4">💰 중고거래 장터</h1>
      <p className="text-gray-600">학생 간 거래 게시글을 여기에 표시할 수 있습니다.</p>
    </div>
  );
}

function LoginPage({ setLoggedIn }) {
  const navigate = useNavigate();
  const handleLogin = () => {
    setLoggedIn(true);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🔐 로그인</h2>
        <p className="text-gray-500 mb-6">버튼을 누르면 로그인 상태로 전환됩니다.</p>
        <button
          onClick={handleLogin}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          로그인
        </button>
      </div>
    </div>
  );
}

// --- Header ---
function Header({ loggedIn, setLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1
        className="text-2xl font-bold text-blue-700 cursor-pointer flex items-center"
        onClick={() => navigate("/")}
      >
        <img
          src="https://placehold.co/32x32/003C9E/ffffff?text=I%26T"
          alt="인하공전 로고"
          className="w-8 h-8 mr-2 rounded-full"
        />
        인하공전 캠퍼스 플랫폼
      </h1>

      <nav className="flex items-center space-x-4">
        <Link className="hover:text-blue-600 flex items-center" to="/">
          <MapIcon className="w-5 h-5 mr-1" /> 지도
        </Link>
        <Link className="hover:text-blue-600 flex items-center" to="/community">
          <CommunityIcon className="w-5 h-5 mr-1" /> 커뮤니티
        </Link>
        <Link className="hover:text-blue-600 flex items-center" to="/market">
          <MarketIcon className="w-5 h-5 mr-1" /> 중고거래
        </Link>

        {loggedIn ? (
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

// --- 메인 앱 ---
function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/login" element={<LoginPage setLoggedIn={setLoggedIn} />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
