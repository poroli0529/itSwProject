import { auth, db } from "../firebase";
export default function LoginPage({ handleLogin }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🔐 로그인</h2>
        <p className="text-gray-500 mb-6">
          Firebase 익명 로그인으로 연결됩니다.
        </p>
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
