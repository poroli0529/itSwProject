// src/api/products.js
const BASE = process.env.REACT_APP_API_BASE || "";
const USE_MOCK = (process.env.REACT_APP_USE_MOCK || "false").toLowerCase() === "true";

const MOCK_KEY = "mock_products";
let mockStore = null;

const INITIAL = [
  {
    itemId: 1,
    title: "삼성 갤럭시 탭 S7+ (키보드 커버 포함)",
    price: 450000,
    condition: "사용감 약간 있음",
    isSold: false,
    createdAt: "2025-10-25T20:30:00",
  },
  {
    itemId: 2,
    title: "로지텍 MX Master 3 마우스",
    price: 65000,
    condition: "거의 새것",
    isSold: true,
    createdAt: "2025-10-25T18:20:00",
  },
  {
    itemId: 3,
    title: "에어팟 프로 2세대",
    price: 180000,
    condition: "생활기스 있음",
    isSold: false,
    createdAt: "2025-10-24T21:10:00",
  },
  {
    itemId: 4,
    title: "인하공전 컴정과 교재 모음 (C언어, OS, 네트워크)",
    price: 25000,
    condition: "사용감 있음",
    isSold: false,
    createdAt: "2025-10-24T17:40:00",
  },
  {
    itemId: 5,
    title: "노트북 쿨링패드 (RGB 팬 6개)",
    price: 15000,
    condition: "양호",
    isSold: true,
    createdAt: "2025-10-24T14:50:00",
  },
  {
    itemId: 6,
    title: "닌텐도 스위치 OLED 화이트",
    price: 370000,
    condition: "거의 새것",
    isSold: false,
    createdAt: "2025-10-23T20:15:00",
  },
  {
    itemId: 7,
    title: "아이패드 9세대 + 애플펜슬 1세대 세트",
    price: 320000,
    condition: "생활기스 있음",
    isSold: true,
    createdAt: "2025-10-23T15:30:00",
  },
  {
    itemId: 8,
    title: "기숙사용 미니 선풍기 (USB충전식)",
    price: 8000,
    condition: "양호",
    isSold: false,
    createdAt: "2025-10-22T10:25:00",
  },
  {
    itemId: 9,
    title: "컴퓨터정보과 과제용 라즈베리파이 4B (8GB)",
    price: 90000,
    condition: "거의 새것",
    isSold: false,
    createdAt: "2025-10-22T09:45:00",
  },
  {
    itemId: 10,
    title: "플스5 디스크 에디션 + 듀얼센스 2개",
    price: 580000,
    condition: "좋음",
    isSold: false,
    createdAt: "2025-10-21T22:00:00",
  },
  {
    itemId: 11,
    title: "캠퍼스용 백팩 (노트북 수납 가능)",
    price: 30000,
    condition: "깨끗함",
    isSold: true,
    createdAt: "2025-10-21T17:10:00",
  },
  {
    itemId: 12,
    title: "삼성 24인치 FHD 모니터 (HDMI 지원)",
    price: 60000,
    condition: "사용감 약간 있음",
    isSold: false,
    createdAt: "2025-10-20T16:20:00",
  },
  {
    itemId: 13,
    title: "레노버 아이디어패드 슬림 5 (Ryzen 5)",
    price: 480000,
    condition: "좋음",
    isSold: false,
    createdAt: "2025-10-20T15:40:00",
  },
  {
    itemId: 14,
    title: "기숙사용 전기포트",
    price: 10000,
    condition: "사용감 있음",
    isSold: true,
    createdAt: "2025-10-19T20:05:00",
  },
  {
    itemId: 15,
    title: "캠퍼스 근처 스터디룸 이용권 (5시간권)",
    price: 9000,
    condition: "미사용",
    isSold: false,
    createdAt: "2025-10-19T18:50:00",
  },
  {
    itemId: 16,
    title: "LG 32인치 모니터 (QHD, 75Hz)",
    price: 120000,
    condition: "양호",
    isSold: false,
    createdAt: "2025-10-18T23:25:00",
  },
];

function loadStore() {
  if (mockStore) return mockStore;
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    if (raw) mockStore = JSON.parse(raw);
    else {
      mockStore = INITIAL.slice();
      localStorage.setItem(MOCK_KEY, JSON.stringify(mockStore));
    }
  } catch (e) {
    mockStore = INITIAL.slice();
  }
  return mockStore;
}

function persist() {
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(mockStore));
  } catch (e) {}
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

export async function getProducts() {
  if (USE_MOCK) {
    const s = loadStore();
    return Promise.resolve((s || []).slice().sort((a, b) => (a.itemId < b.itemId ? 1 : -1)));
  }
  return request("/api/products", { method: "GET" });
}

export async function getProduct(id) {
  if (USE_MOCK) {
    const s = loadStore();
    const it = (s || []).find((x) => String(x.itemId) === String(id) || String(x.id) === String(id));
    return Promise.resolve(it || null);
  }
  return request(`/api/products/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function addProduct(payload) {
  if (USE_MOCK) {
    const s = loadStore();
    const nextId = (s.reduce((max, it) => (it.itemId > max ? it.itemId : max), 0) || 0) + 1;
    const now = new Date().toISOString();
    let obj = null;
    if (typeof FormData !== "undefined" && payload instanceof FormData) {
      obj = formDataToObj(payload);
    } else if (payload instanceof Object) {
      obj = { ...payload };
    } else {
      throw new Error("Unsupported payload for mock addProduct");
    }

    let imageUrl = null;
    if (obj.image && typeof obj.image === "object") {
      try {
        imageUrl = await readFileAsDataURL(obj.image);
      } catch (e) {
        console.warn("이미지 변환 실패:", e);
      }
    }

    const item = {
      itemId: nextId,
      title: obj.title || obj.name || "(제목 없음)",
      price: parseInt(obj.price, 10) || 0,
      isSold: obj.isSold === "true" || obj.isSold === true ? true : false,
      createdAt: obj.createdAt || now,
      description: obj.description || obj.desc || "",
      category: obj.category || "",
      ...(imageUrl ? { imageUrl } : {}),
    };
    s.unshift(item);
    mockStore = s;
    persist();
    return Promise.resolve(item);
  }

  // real API
  if (typeof FormData !== "undefined" && payload instanceof FormData) {
    // send form data directly (no content-type header)
    return fetch(`${BASE}/api/products`, { method: "POST", credentials: "include", body: payload });
  }
  return request(`/api/products`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateProduct(id, payload) {
  if (USE_MOCK) {
    const s = loadStore();
    const idx = s.findIndex((it) => String(it.itemId) === String(id) || String(it.id) === String(id));
    if (idx === -1) throw new Error("Not found");

    let obj = null;
    if (typeof FormData !== "undefined" && payload instanceof FormData) {
      obj = formDataToObj(payload);
    } else if (payload instanceof Object) {
      obj = { ...payload };
    } else {
      throw new Error("Unsupported payload for mock updateProduct");
    }

    // handle image
    if (obj.image && typeof obj.image === "object") {
      try {
        const imageUrl = await readFileAsDataURL(obj.image);
        obj.imageUrl = imageUrl;
      } catch (e) {
        console.warn("이미지 변환 실패:", e);
      }
    }

    const existing = s[idx];
    const updated = {
      ...existing,
      title: obj.title || obj.name || existing.title,
      price: typeof obj.price !== 'undefined' ? parseInt(obj.price, 10) || 0 : existing.price,
      isSold: obj.isSold === "true" || obj.isSold === true ? true : (typeof obj.isSold !== 'undefined' ? !!obj.isSold : existing.isSold),
      createdAt: obj.createdAt || existing.createdAt,
      description: obj.description || obj.desc || existing.description,
      category: obj.category || existing.category,
      ...(obj.imageUrl ? { imageUrl: obj.imageUrl } : {}),
    };
    s[idx] = updated;
    mockStore = s;
    persist();
    return Promise.resolve(updated);
  }

  if (typeof FormData !== "undefined" && payload instanceof FormData) {
    return fetch(`${BASE}/api/products/${encodeURIComponent(id)}`, { method: "PUT", credentials: "include", body: payload });
  }
  return request(`/api/products/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteProduct(id) {
  if (USE_MOCK) {
    const s = loadStore();
    const idx = s.findIndex((it) => String(it.itemId) === String(id));
    if (idx === -1) throw new Error("Not found");
    s.splice(idx, 1);
    mockStore = s;
    persist();
    return Promise.resolve({ ok: true });
  }
  return request(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}

const api = { getProducts, addProduct, deleteProduct };
export default api;
