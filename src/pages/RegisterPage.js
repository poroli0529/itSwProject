// pages/RegisterPage.js
import { useState } from "react";

const RegisterPage = () => {
  const [form, setForm] = useState({ 
    stdno: "",
    username: "",
     password: "" 
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("회원가입 요청:", form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>회원가입1243</h2>
         <input
        type="text"
        placeholder="학번"
        value={form.stdno}
        onChange={(e) => setForm({ ...form, stdno: e.target.value })}
        
      /><br/>
      <input
        type="text"
        placeholder="아이디"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      /><br/>
      <input
        type="password"
        placeholder="비밀번호"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      /><br/>
      <button type="submit">회원가입</button>
    </form>
  );
};

export default RegisterPage;
