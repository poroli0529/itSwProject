import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addProduct, getProduct, updateProduct } from "../api/products";
import { getCurrentUser } from "../api/auth";

export default function MarketWrite() {
  // always register items as 판매중 (isSold=false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    isSold: false,
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const params = useParams();
  const editingId = params?.id;
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        setMe(u);
      } catch (e) {
        console.warn("현재 사용자 정보 로드 실패:", e);
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e?.preventDefault();
    const { title, description, price, category, isSold } = form;
    if (!title.trim() || price === "")
      return alert("제목과 가격은 필수입니다.");
    setSaving(true);
    try {
      if (file) {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("description", description);
        fd.append("price", String(parseInt(price, 10) || 0));
        fd.append("category", category);
        fd.append("isSold", String(!!isSold));
        fd.append("createdAt", new Date().toISOString());
        if (me) {
          fd.append("authorId", me.id || me.uid || "");
          fd.append("authorName", me.username || me.nickname || "");
        }
        fd.append("image", file);
        if (editingId) await updateProduct(editingId, fd);
        else await addProduct(fd);
      } else {
        const payload = {
          title,
          description,
          price: parseInt(price, 10) || 0,
          category,
          isSold: !!isSold,
          createdAt: new Date().toISOString(),
          authorId: me?.id || me?.uid || null,
          authorName: me?.username || me?.nickname || "",
        };
        if (editingId) await updateProduct(editingId, payload);
        else await addProduct(payload);
      }
      navigate("/market");
    } catch (err) {
      console.error(err);
      alert("상품 등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const p = await getProduct(editingId);
        if (!p) return alert("존재하지 않는 상품입니다.");
        setForm({
          title: p.title || "",
          description: p.description || "",
          price: p.price || "",
          category: p.category || "",
          isSold: !!p.isSold,
        });
      } catch (e) {
        console.error(e);
        alert("상품을 불러오지 못했습니다.");
      }
    })();
  }, [editingId]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {editingId ? "상품 수정" : "상품 등록"}
      </h1>

      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        <div>
          <label className="block text-sm font-medium mb-1">제품 이름</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border w-full p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">제품 설명</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border w-full p-2 rounded"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">제품 가격</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="border w-full p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">카테고리</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border w-full p-2 rounded"
            />
          </div>
        </div>

        {/* 판매 상태는 항상 판매중으로 등록: 체크박스 제거 */}

        <div>
          <label className="block text-sm font-medium mb-1">
            이미지 (선택)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving
              ? editingId
                ? "수정중..."
                : "등록중..."
              : editingId
              ? "수정"
              : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
