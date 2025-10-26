import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addPost, getPost, updatePost, deletePost } from "../api/posts";

export default function CommunityWrite() {
  const { id } = useParams(); // optional - when editing
  const isEdit = Boolean(id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const p = await getPost(id);
        if (p) {
          setTitle(p.title || "");
          setContent(p.content || "");
        }
      } catch (e) {
        console.error("게시글 불러오기 실패:", e);
      }
    })();
  }, [id, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("content", content);
      if (file) form.append("image", file);
      if (isEdit) {
        await updatePost(id, form);
      } else {
        await addPost(form);
      }
      navigate("/community");
    } catch (err) {
      console.error(err);
      alert("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
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

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "글 수정" : "글 작성"}
      </h1>
      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        <div>
          <label className="block text-sm text-gray-700">제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border w-full p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border w-full p-2 rounded"
            rows={6}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">이미지 첨부</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/community")}
            className="px-4 py-2 border rounded"
          >
            취소
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={onDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded border border-black"
            >
              {loading ? "처리중..." : "삭제"}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "저장중..." : isEdit ? "수정" : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
