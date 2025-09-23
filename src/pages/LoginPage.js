// pages/LoginPage.js
import { useState } from "react";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("로그인 요청:", form);
    localStorage.setItem("token", "fake-jwt-token");
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>로그인</h2>
    
      <input
        type="text"
        placeholder="아이디"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button type="submit">로그인</button>
    </form>
  );
};

export default LoginPage;
