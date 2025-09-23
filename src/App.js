// App.js
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MapPage from "./pages/MapPage";
import MarketPage from "./pages/MarketPage";
import CommunityPage from "./pages/CommunityPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import UserPage from "./pages/UserPage";
import { useState } from "react";
import "./App.css"
import { useNavigate } from "react-router-dom";
function App() {
  return (
    <Router>
      <header className="header">
        <nav>
          <ul>
            <li><Link to="/map">지도</Link></li>
            <li><Link to="/market">거래</Link></li>
            <li><Link to="/community">커뮤니티</Link></li>
            <li><Link to="/user">내 정보</Link></li>
          </ul>
        
          <ButtonComponent/>
       

          
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/map" element={<MapPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user" element={<UserPage />} />
        </Routes>
      </main>

      
    </Router>
  );
}

const ButtonComponent= () =>{

  const navigate  = useNavigate("/register");

  return (
    <div  className="rgButton">
    <button onClick={() => navigate("/register")}>
      회원가입
    </button>
    <button onClick={()=>navigate("/login")}>
      로그인
    </button>
    </div>
  );

      }

export default App;
