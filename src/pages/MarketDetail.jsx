import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, deleteProduct } from "../api/products";

export default function MarketDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const data = await getProduct(id);
      setItem(data || null);
    } catch (e) {
      console.error("상품 상세 가져오기 실패:", e);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!item) return;
    const ok = window.confirm("정말로 이 게시물을 삭제하시겠습니까?");
    if (!ok) return;
    try {
      await deleteProduct(item.itemId || item.id);
      navigate("/market");
    } catch (e) {
      console.error("삭제 실패:", e);
      alert("삭제에 실패했습니다.");
    }
  };

  const canEditOrDelete = () => {
    if (!user || !item) return false;
    return (
      user.role === "ADMIN" ||
      String(user.id) === String(item.authorId) ||
      String(user.uid) === String(item.authorId) ||
      user.username === item.authorName ||
      String(user.id) === String(item.sellerId) ||
      String(user.uid) === String(item.sellerId)
    );
  };

  if (loading) return <div className="p-8">로딩 중...</div>;
  if (!item) return <div className="p-8">상품을 찾을 수 없습니다.</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded shadow">
      <div className="flex items-start space-x-6">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-48 h-48 object-cover rounded"
          />
        ) : (
          <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
            이미지 없음
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
          <div className="text-sm text-gray-600 mb-4">
            판매자 ID:{" "}
            <span className="font-medium">
              {item.sellerId ?? item.authorId ?? "-"}
            </span>
            <span className="ml-4">
              카테고리:{" "}
              <span className="font-medium">{item.category || "-"}</span>
            </span>
          </div>

          <div className="mb-4">
            <div className="text-xl text-blue-600 font-bold">
              {item.price ? item.price + " 원" : "가격 협의"}
            </div>
            <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
              {item.description || item.desc || "-"}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <div>
              판매상태:{" "}
              <span className="font-medium">
                {item.isSold ? "판매완료" : "판매중"}
              </span>
            </div>
            <div className="mt-1">
              작성일:{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString("ko-KR")
                : "-"}
            </div>
          </div>

          <div className="mt-6 flex space-x-2 justify-end">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1 border rounded"
            >
              목록
            </button>
            {canEditOrDelete() && (
              <>
                <button
                  onClick={() =>
                    navigate(`/market/edit/${item.itemId || item.id}`)
                  }
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* 댓글 섹션 시작 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">댓글</h2>

        {user ? (
          <div className="mb-4 border border-gray-200 p-4 rounded">
            <div className="text-sm text-gray-600">
              작성자:{" "}
              <span className="font-medium">
                {user.nickname || user.username}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-4 text-sm text-gray-600">
            로그인 후 댓글을 작성할 수 있습니다.
          </div>
        )}

        <CommentList itemId={item.itemId || item.id} user={user} />
      </div>
      {/* 댓글 섹션 끝 */}
    </div>
  );
}

function commentsKey(itemId) {
  return `comments_${itemId}`;
}

function loadComments(itemId) {
  try {
    const raw = localStorage.getItem(commentsKey(itemId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function persistComments(itemId, comments) {
  try {
    localStorage.setItem(commentsKey(itemId), JSON.stringify(comments));
  } catch (e) {}
}

function CommentForm({ itemId, user, onAdded }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("로그인 후 작성하세요.");
      return;
    }
    const comments = loadComments(itemId);
    const now = new Date().toISOString();
    const comment = {
      id: String(Date.now()),
      title: user.nickname || user.username || "익명",
      content: content.trim(),
      createdAt: now,
      authorId: user.id ?? user.uid,
      authorName: user.nickname || user.username,
    };
    comments.unshift(comment);
    persistComments(itemId, comments);
    setContent("");
    if (typeof onAdded === "function") onAdded();
    // trigger a storage event for other tabs/components (not necessary but helpful)
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        className="w-full border border-gray-200 p-2 mb-2 rounded"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글 내용을 입력하세요."
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          등록
        </button>
      </div>
    </form>
  );
}

function CommentList({ itemId, user }) {
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    setComments(loadComments(itemId));

    const handleStorage = () => setComments(loadComments(itemId));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [itemId]);

  const onAdded = () => setComments(loadComments(itemId));

  const canModify = (c) => {
    if (!user) return false;
    return (
      user.role === "ADMIN" ||
      String(user.id) === String(c.authorId) ||
      String(user.uid) === String(c.authorId)
    );
  };

  const remove = (c) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    const next = comments.filter((x) => x.id !== c.id);
    persistComments(itemId, next);
    setComments(next);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditingContent(c.content || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const saveEdit = (c) => {
    const next = comments.map((x) =>
      x.id === c.id
        ? { ...x, content: editingContent, updatedAt: new Date().toISOString() }
        : x
    );
    persistComments(itemId, next);
    setComments(next);
    cancelEdit();
  };

  return (
    <div>
      <CommentForm itemId={itemId} user={user} onAdded={onAdded} />
      <div className="mt-4 space-y-3">
        {comments.length === 0 && (
          <div className="text-sm text-gray-500">등록된 댓글이 없습니다.</div>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className="border border-gray-100 p-3 rounded bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">{c.title}</div>
                <div className="text-xs text-gray-500">
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleString("ko-KR")
                    : "-"}
                </div>
              </div>
              <div className="text-right">
                {canModify(c) && (
                  <div className="space-x-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="text-sm text-blue-600"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => remove(c)}
                      className="text-sm text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2">
              {editingId === c.id ? (
                <>
                  <textarea
                    className="w-full border p-2"
                    rows={3}
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 border rounded"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => saveEdit(c)}
                      className="px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      저장
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {c.content}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
