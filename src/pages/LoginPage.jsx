import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage({ handleLogin }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await handleLogin({ id, password });
      navigate("/");
    } catch (err) {
      alert(err.message || "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  const useMock = process.env.REACT_APP_USE_MOCK === "true";
  const autoLoginMock = async () => {
    setLoading(true);
    try {
      await handleLogin({ id: "202244083", password: "202244083" });
      navigate("/");
    } catch (err) {
      alert(err.message || "자동 로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="bg-white p-10 rounded-xl shadow-xl text-center w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🔐 로그인</h2>
        <div className="mb-3 text-left">
          <label className="block text-sm text-gray-600">학번 (ID)</label>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="border w-full p-2 rounded mt-1"
            required
          />
        </div>
        <div className="mb-4 text-left">
          <label className="block text-sm text-gray-600">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border w-full p-2 rounded mt-1"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition w-full"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <div className="mt-4 text-sm">
          아직 계정이 없나요?{" "}
          <Link to="/signup" className="text-blue-600">
            회원가입
          </Link>
        </div>
        {useMock && (
          <div className="mt-3 text-sm">
            <button
              type="button"
              onClick={autoLoginMock}
              className="text-sm text-gray-700 underline"
            >
              테스트 계정으로 자동 로그인 (202244083)
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
