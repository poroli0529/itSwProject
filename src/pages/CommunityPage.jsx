import { useState, useEffect } from "react";
import { getPosts, deletePost } from "../api/posts";
import { useNavigate } from "react-router-dom";
import logo from "./../images/logo.png";
const USE_MOCK =
  (process.env.REACT_APP_USE_MOCK || "false").toLowerCase() === "true";

export default function CommunityPage({ user }) {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data || []);
    } catch (e) {
      console.error("게시글 불러오기 실패:", e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await deletePost(id);
      await fetchPosts();
    } catch (e) {
      console.error("삭제 실패:", e);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          <img src={logo} alt="logo" className="inline-block h-16 w-auto" />
          <span> 커뮤니티 게시판</span>
        </h1>
        {user ? (
          <button
            onClick={() => navigate("/community/new")}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            글 작성
          </button>
        ) : (
          <p className="text-gray-500">로그인 후 글을 작성할 수 있습니다.</p>
        )}
      </div>

      {/* 게시글 리스트 영역 (1px 회색 테두리 배경으로 그룹화) */}
      <div className="border border-gray-300 bg-gray-50 rounded-md p-4 space-y-4">
        {posts.map((p) => {
          const created = p.createdAt ? new Date(p.createdAt) : null;
          const prettyDate = created ? created.toLocaleString() : "-";
          const snippet =
            p.content && p.content.length > 180
              ? p.content.slice(0, 180) + "..."
              : p.content;

          return (
            <article
              key={p.id}
              onClick={() => navigate(`/community/view/${p.id}`)}
              className="bg-white border border-gray-300 rounded-md p-4 shadow-sm cursor-pointer hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-gray-800">
                  {p.title}
                </h2>
                <time className="text-xs text-gray-400">{prettyDate}</time>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-gray-700">작성자: </span>
                <span>{p.writer || p.author || p.authorId || "익명"}</span>
              </div>

              <p className="mt-3 text-gray-700 break-words">{snippet}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">ID: {p.id}</div>
                <div className="space-x-3">
                  {(USE_MOCK ||
                    (user && (user.id || user.uid) === p.authorId)) && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/community/edit/${p.id}`);
                        }}
                        className="text-blue-600 hover:underline text-sm border border-black px-2 py-1 rounded"
                      >
                        수정
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm border border-black px-2 py-1 rounded"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
