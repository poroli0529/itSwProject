// src/api/posts.js
const BASE = process.env.REACT_APP_API_BASE || "";
const USE_MOCK = (process.env.REACT_APP_USE_MOCK || "false").toLowerCase() === "true";

// --- Mock data & helpers ---
const INITIAL_MOCK_POSTS = [
  {
    id: 1,
    title: "내일 공강인데 뭐하실분?",
    content:
      "내일 목요일이라 공강인데 혹시 학교 근처에서 볼링이나 당구 치실 분 있나요? 요즘 날씨 좋아서 나가고 싶네요 ㅋㅋ",
    writer: "이승종",
    createdAt: "2025-10-26T21:00:00",
  },
  {
    id: 2,
    title: "컴퓨터정보과 과제 질문 있습니다!",
    content:
      "이번주에 나온 자바 GUI 과제 혹시 다들 하셨나요? 이벤트 처리 부분에서 오류가 나는데 도와주실 분 있으신가요?",
    writer: "김태완",
    createdAt: "2025-10-25T20:45:00",
  },
  {
    id: 3,
    title: "인하공전 도서관 와이파이 너무 느리네요",
    content:
      "요즘 도서관에서 와이파이 속도가 너무 느려요ㅠㅠ 노트북으로 코딩할 때 자꾸 끊겨서 스트레스...",
    writer: "박유정",
    createdAt: "2025-10-25T19:12:00",
  },
  {
    id: 4,
    title: "캠퍼스 내 맛집 추천좀요!",
    content:
      "학교 근처에 점심 맛집 추천 좀 부탁드립니다. 특히 돈까스나 덮밥류로요. 가격 괜찮고 양 많은 곳이면 좋아요.",
    writer: "정현우",
    createdAt: "2025-10-24T18:40:00",
  },
  {
    id: 5,
    title: "중고 노트북 팝니다 (i5 11세대)",
    content:
      "학교 과제용으로 쓰던 노트북 정리합니다. i5 11세대 / 16GB RAM / 512GB SSD / 45만원 생각중이에요. 관심 있으시면 댓글주세요.",
    writer: "최지훈",
    createdAt: "2025-10-24T14:30:00",
  },
  {
    id: 6,
    title: "오늘 인하공전 매점 진짜 붐비네요;;",
    content:
      "12시쯤에 매점 갔는데 줄이 너무 길어서 포기했습니다... 혹시 점심시간 피해서 갈만한 시간대 추천해주실 분?",
    writer: "김민지",
    createdAt: "2025-10-23T12:20:00",
  },
  {
    id: 7,
    title: "캡스톤 프로젝트 주제 같이 고민하실분!",
    content:
      "캡스톤 주제를 AI나 웹보안 쪽으로 생각 중인데, 혹시 비슷한 관심 있는 분 계신가요? 팀 같이 하실 분 구합니다.",
    writer: "이승종",
    createdAt: "2025-10-22T22:15:00",
  },
  {
    id: 8,
    title: "기숙사 방음 너무 심하네요 ㅠㅠ",
    content:
      "기숙사 살고 있는데 옆방에서 밤마다 게임 소리가 너무 크게 들립니다. 혹시 방음 대책 아시는 분 있나요?",
    writer: "박지은",
    createdAt: "2025-10-22T20:55:00",
  },
  {
    id: 9,
    title: "중간고사 끝나고 다같이 노래방 가실분!",
    content:
      "시험 끝나서 너무 해방감 느껴져요 ㅋㅋ 다들 고생하셨습니다. 혹시 금요일 저녁에 노래방 번개 어때요?",
    writer: "정태완",
    createdAt: "2025-10-21T23:10:00",
  },
  {
    id: 10,
    title: "학교 와이파이 비번 뭐였죠?",
    content:
      "기숙사 와이파이는 연결했는데 캠퍼스 와이파이 비번이 생각이 안나네요. 혹시 알고 계신 분 있을까요?",
    writer: "이서현",
    createdAt: "2025-10-21T09:35:00",
  },
];

const MOCK_STORAGE_KEY = "mock_posts";
let mockStore = null;

function loadMockStore() {
  if (mockStore) return mockStore;
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) {
      mockStore = JSON.parse(raw);
    } else {
      mockStore = INITIAL_MOCK_POSTS.slice();
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockStore));
    }
  } catch (e) {
    // localStorage not available or parse error -> fallback to initial
    mockStore = INITIAL_MOCK_POSTS.slice();
  }
  return mockStore;
}

function persistMock() {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockStore));
  } catch (e) {
    // ignore
  }
}

function formDataToObj(fd) {
  const obj = {};
  for (const pair of fd.entries()) {
    const [k, v] = pair;
    obj[k] = v;
  }
  return obj;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });
}

// --- Real API helper ---
async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
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

// --- Exports: choose mock or real behavior ---
export async function getPosts() {
  if (USE_MOCK) {
    const s = loadMockStore();
    // return a shallow copy to avoid external mutations
    return Promise.resolve(s.slice().sort((a, b) => (a.id < b.id ? 1 : -1)));
  }
  return request("/api/posts", { method: "GET" });
}

export async function getPost(id) {
  if (USE_MOCK) {
    const s = loadMockStore();
    const found = s.find((x) => String(x.id) === String(id));
    if (!found) throw new Error("Not found");
    return Promise.resolve(found);
  }
  return request(`/api/posts/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function addPost(payload) {
  if (USE_MOCK) {
    const s = loadMockStore();
    let obj = null;
    if (typeof FormData !== "undefined" && payload instanceof FormData) {
      obj = formDataToObj(payload);
    } else if (payload instanceof Object) {
      obj = { ...payload };
    } else {
      throw new Error("Unsupported payload for mock addPost");
    }
    const nextId = s.reduce((max, p) => (p.id > max ? p.id : max), 0) + 1;
    const now = new Date().toISOString();
    // handle possible File in obj (from FormData)
    let imageUrl = null;
    if (obj.image && typeof obj.image === "object" && obj.image instanceof File) {
      try {
        imageUrl = await readFileAsDataURL(obj.image);
      } catch (e) {
        console.warn("이미지 변환 실패:", e);
      }
    }

    const newPost = {
      id: nextId,
      title: obj.title || "(제목 없음)",
      content: obj.content || "",
      writer: obj.writer || (obj.author && String(obj.author)) || "익명",
      createdAt: obj.createdAt || now,
      ...(imageUrl ? { imageUrl } : {}),
    };
    s.unshift(newPost);
    mockStore = s;
    persistMock();
    return Promise.resolve(newPost);
  }

  if (payload instanceof FormData) {
    return request(`/api/posts`, { method: "POST", body: payload, headers: {} });
  }
  return request(`/api/posts`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updatePost(id, payload) {
  if (USE_MOCK) {
    const s = loadMockStore();
    const idx = s.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) throw new Error("Not found");
    let obj = null;
    if (typeof FormData !== "undefined" && payload instanceof FormData) {
      obj = formDataToObj(payload);
    } else if (payload instanceof Object) {
      obj = { ...payload };
    } else {
      throw new Error("Unsupported payload for mock updatePost");
    }

    // handle file -> dataURL if provided
    if (obj.image && typeof obj.image === "object" && obj.image instanceof File) {
      try {
        const imageUrl = await readFileAsDataURL(obj.image);
        obj.imageUrl = imageUrl;
        delete obj.image; // remove raw File
      } catch (e) {
        console.warn("이미지 변환 실패:", e);
      }
    }
    const updated = { ...s[idx], ...obj };
    s[idx] = updated;
    mockStore = s;
    persistMock();
    return Promise.resolve(updated);
  }
  if (payload instanceof FormData) {
    return request(`/api/posts/${encodeURIComponent(id)}`, { method: "PUT", body: payload, headers: {} });
  }
  return request(`/api/posts/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deletePost(id) {
  if (USE_MOCK) {
    const s = loadMockStore();
    const idx = s.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) throw new Error("Not found");
    s.splice(idx, 1);
    mockStore = s;
    persistMock();
    return Promise.resolve({ ok: true });
  }
  return request(`/api/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
}

const api = { getPosts, getPost, addPost, updatePost, deletePost };
export default api;
