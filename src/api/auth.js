// src/api/auth.js

// 🔧 .env 환경변수
// REACT_APP_API_BASE=http://localhost:8080
// REACT_APP_USE_MOCK=true

const BASE = process.env.REACT_APP_API_BASE || "";
const USE_MOCK = process.env.REACT_APP_USE_MOCK === "true";

// 🧩 테스트용 더미 유저
const MOCK_USER = {
  id: 202244083,
  uid: "202244083",
  username: "이승종",
  email: "00@00.com",
  nickname: "test",
  phone: "010-0000-0000",
  status: "ACTIVE",
  role: "ADMIN",
};
// NOTE: 운영자 계정(예: 202244083)은 필요 시 localStorage에서 role을 ADMIN으로 설정해서
// 삭제/수정/추가 권한을 부여할 수 있습니다. 기본 더미 사용자는 아래 MOCK_USER를 사용합니다.

/**
 * 공통 요청 함수
 */
async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include", // 쿠키 기반 세션 유지 (Spring Boot와 연동 시 필요)
    headers: { "Content-Type": "application/json" },
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return null;
}

/**
 * 현재 로그인된 유저 가져오기
 */
export async function getCurrentUser() {
  if (USE_MOCK) {
    try {
      const raw = localStorage.getItem("mock_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  try {
    const data = await request("/api/auth/me", { method: "GET" });
    return data || null;
  } catch (e) {
    // 로그인 세션이 없거나 만료된 경우
    return null;
  }
}

/**
 * 익명 로그인 (테스트용)
 */
export async function loginAnon() {
  if (USE_MOCK) {
    localStorage.setItem("mock_user", JSON.stringify(MOCK_USER));
    console.log("✅ 더미 사용자 로그인됨:", MOCK_USER);
    return MOCK_USER;
  }

  const data = await request("/api/auth/anon", { method: "POST" });
  return data;
}

/**
 * 로그아웃
 */
export async function logout() {
  if (USE_MOCK) {
    localStorage.removeItem("mock_user");
    console.log("🚪 더미 사용자 로그아웃 완료");
    return;
  }

  await request("/api/auth/logout", { method: "POST" });
}

/**
 * 일반 로그인
 * credentials: { id, password }
 */
export async function login(credentials) {
  if (USE_MOCK) {
    const idStr = String(credentials.id);
    const pwStr = String(credentials.password);

    // 간단한 Mock 인증 로직
    if (
      (idStr === String(MOCK_USER.id) || idStr === MOCK_USER.username) &&
      pwStr === "202244083"
    ) {
      localStorage.setItem("mock_user", JSON.stringify(MOCK_USER));
      console.log("✅ 더미 로그인 성공:", MOCK_USER);
      return MOCK_USER;
    }

    const err = new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
    err.status = 401;
    throw err;
  }

  // 실제 백엔드 로그인 API 호출
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * 회원가입
 * user = { id, username, email, password, nickname, phone, status, role }
 */
export async function register(user) {
  if (USE_MOCK) {
    const mockRegistered = { ...user, uid: String(user.id) };
    localStorage.setItem("mock_user", JSON.stringify(mockRegistered));
    console.log("✅ 더미 회원가입 완료:", mockRegistered);
    return mockRegistered;
  }

  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

// 기본 export
const api = { getCurrentUser, loginAnon, login, register, logout };
export default api;
