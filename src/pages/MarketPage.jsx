import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";

export default function MarketPage({ user }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", desc: "" });

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!user) return alert("로그인 후 이용하세요!");
    const { name, price, desc } = form;
    if (!name.trim() || !price.trim()) return;
    await addDoc(collection(db, "products"), {
      name,
      price,
      desc,
      authorId: user.uid,
      timestamp: serverTimestamp(),
    });
    setForm({ name: "", price: "", desc: "" });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        💰 중고거래 장터
      </h1>

      {user && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow space-y-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="상품명"
            className="border w-full p-2 rounded"
          />
          <input
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="가격 (원)"
            className="border w-full p-2 rounded"
          />
          <textarea
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            placeholder="설명"
            className="border w-full p-2 rounded"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            등록
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 shadow rounded-lg flex justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-blue-600 font-bold">{item.price} 원</p>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
            {user && user.uid === item.authorId && (
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
