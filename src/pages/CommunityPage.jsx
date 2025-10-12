import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";

export default function CommunityPage({ user }) {
  const [posts, setPosts] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAddPost = async () => {
    if (!user) return alert("로그인 후 이용하세요!");
    if (!input.trim()) return;
    await addDoc(collection(db, "posts"), {
      content: input,
      authorId: user.uid,
      timestamp: serverTimestamp(),
    });
    setInput("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "posts", id));
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        💬 커뮤니티 게시판
      </h1>

      {user ? (
        <div className="flex mb-4 space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="글을 작성하세요"
            className="border border-gray-300 p-2 flex-grow rounded-lg"
          />
          <button
            onClick={handleAddPost}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            등록
          </button>
        </div>
      ) : (
        <p className="text-gray-500 mb-4">로그인 후 글을 작성할 수 있습니다.</p>
      )}

      {posts.map((p) => (
        <div key={p.id} className="bg-white shadow p-4 mb-3 rounded-lg border">
          <p className="font-medium">{p.content}</p>
          <div className="text-sm text-gray-400 mt-1 flex justify-between">
            <span>{p.authorId?.substring(0, 8)}</span>
            {user && p.authorId === user.uid && (
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
