import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export default function SignupPage() {
  const [form, setForm] = useState({
    id: "",
    username: "",
    email: "",
    password: "",
    nickname: "",
    phone: "",
    status: "ACTIVE",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // id는 숫자형으로 보내는 것이 백엔드 기대일 수 있음
      const payload = { ...form, id: Number(form.id) };
      await register(payload);
      alert("회원가입 성공. 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.message || "회원가입 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-4">회원가입</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">학번 (ID)</label>
            <input
              value={form.id}
              onChange={onChange("id")}
              className="border w-full p-2 rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">이름</label>
            <input
              value={form.username}
              onChange={onChange("username")}
              className="border w-full p-2 rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={onChange("email")}
              className="border w-full p-2 rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">전화번호</label>
            <input
              value={form.phone}
              onChange={onChange("phone")}
              className="border w-full p-2 rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">닉네임</label>
            <input
              value={form.nickname}
              onChange={onChange("nickname")}
              className="border w-full p-2 rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={onChange("password")}
              className="border w-full p-2 rounded mt-1"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {loading ? "가입중..." : "회원가입"}
          </button>
        </div>
      </form>
    </div>
  );
}
