import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPost, deletePost } from "../api/posts";

const USE_MOCK =
  (process.env.REACT_APP_USE_MOCK || "false").toLowerCase() === "true";

function commentsKey(postId) {
  return `comments_${postId}`;
}

function loadComments(postId) {
  try {
    const raw = localStorage.getItem(commentsKey(postId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveComments(postId, comments) {
  try {
    localStorage.setItem(commentsKey(postId), JSON.stringify(comments));
  } catch (e) {
    // ignore
  }
}

export default function CommunityDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentAuthor, setCommentAuthor] = useState(
    (user && (user.username || user.name)) || "익명"
  );
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const p = await getPost(id);
        setPost(p);
      } catch (e) {
        console.error("게시글 불러오기 실패:", e);
        alert("게시글을 불러올 수 없습니다.");
        navigate("/community");
      }
    })();

    // load comments from localStorage (mock)
    try {
      const c = loadComments(id);
      setComments(c);
    } catch (e) {
      setComments([]);
    }
  }, [id, navigate]);

  const onDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      await deletePost(id);
      navigate("/community");
    } catch (err) {
      console.error(err);
      alert("삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (e) => {
    e.stopPropagation();
    navigate(`/community/edit/${id}`);
  };

  const onAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newC = {
      id: Date.now(),
      author: commentAuthor || "익명",
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [newC, ...comments];
    setComments(next);
    if (USE_MOCK) saveComments(id, next);
    setCommentText("");
  };

  const onDeleteComment = (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    const next = comments.filter((c) => String(c.id) !== String(commentId));
    setComments(next);
    if (USE_MOCK) saveComments(id, next);
  };

  const onStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text || "");
  };

  const onCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const onSaveEditComment = (commentId) => {
    const next = comments.map((c) => {
      if (String(c.id) !== String(commentId)) return c;
      return {
        ...c,
        text: editingCommentText,
        editedAt: new Date().toISOString(),
      };
    });
    setComments(next);
    if (USE_MOCK) saveComments(id, next);
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  if (!post) return <div className="p-8">로딩 중...</div>;

  const created = post.createdAt ? new Date(post.createdAt) : null;
  const prettyDate = created ? created.toLocaleString() : "-";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <article className="bg-white border border-gray-300 rounded-md p-6 shadow-sm">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
            <div className="text-sm text-gray-600">
              작성자:{" "}
              <span className="font-medium text-gray-800">
                {post.writer || post.author || "익명"}
              </span>
              <span className="ml-3 text-xs text-gray-400">{prettyDate}</span>
            </div>
          </div>
          <div className="space-x-2">
            <button
              onClick={onEdit}
              disabled={loading}
              className="text-blue-600 hover:underline text-sm border border-black px-2 py-1 rounded"
            >
              수정
            </button>
            <button
              onClick={onDelete}
              disabled={loading}
              className="text-red-500 hover:text-red-700 text-sm border border-black px-2 py-1 rounded"
            >
              {loading ? "처리중..." : "삭제"}
            </button>
          </div>
        </header>

        {post.imageUrl && (
          <div className="mt-4">
            <img
              src={post.imageUrl}
              alt="게시글 이미지"
              className="max-w-full rounded-md border"
            />
          </div>
        )}

        <div className="mt-6 text-gray-800 whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      {/* 댓글 섹션 */}
      <section className="mt-6 max-w-3xl">
        <h2 className="text-lg font-semibold mb-2">댓글</h2>

        <form onSubmit={onAddComment} className="space-y-2 mb-4">
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
          <div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="border p-2 rounded w-full"
              rows={3}
              placeholder="댓글을 입력하세요"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              댓글 등록
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-gray-500">등록된 댓글이 없습니다.</p>
          )}
          {comments.map((c) => (
            <div
              key={c.id}
              className="border border-gray-200 rounded p-3 bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="text-sm font-medium">{c.author}</div>
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-gray-400">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
                  </div>
                  {/* edit/delete buttons (gray text) on the right */}
                  {editingCommentId !== c.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onStartEditComment(c)}
                        className="text-gray-500 text-sm"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => onDeleteComment(c.id)}
                        className="text-gray-500 text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 text-gray-700 whitespace-pre-wrap">
                {editingCommentId === c.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      className="border p-2 rounded w-full"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={onCancelEditComment}
                        className="px-3 py-1 border rounded text-sm"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => onSaveEditComment(c.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  c.text
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
