import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../api/products";

export default function MarketPage({ user }) {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const data = await getProducts();
      setItems(data || []);
    } catch (e) {
      console.error("상품 불러오기 실패:", e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // registration moved to separate page (/market/new)

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      await fetchItems();
    } catch (e) {
      console.error("삭제 실패:", e);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        💰 중고거래 장터
      </h1>

      {user && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => navigate("/market/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            등록
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* 그리드 전체에 2px 회색 테두리, 내부 여백을 줘서 카드와 테두리 사이 간격 확보 */}
        <div className="border-2 border-gray-300 p-3">
          <div className="grid grid-cols-4 gap-4">
            {items.slice(0, 16).map((item) => (
              <div
                key={item.itemId || item.id}
                className="bg-white p-4 flex flex-col h-full"
                style={{ border: "1px solid #000" }}
              >
                <div className="flex-1">
                  {item.imageUrl ? (
                    <div className="mb-2">
                      <img
                        src={item.imageUrl}
                        alt={item.title || "썸네일"}
                        className="w-full h-40 object-cover rounded mb-2"
                      />
                    </div>
                  ) : null}

                  <h2 className="text-lg font-semibold mb-2">
                    {item.title || item.name}
                  </h2>
                  <p className="text-blue-600 font-bold mb-2">
                    {item.price ? item.price + " 원" : "가격 협의"}
                  </p>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  <div>
                    상태:{" "}
                    <span className="font-medium">
                      {item.isSold ? "판매완료" : "판매중"}
                    </span>
                  </div>
                  <div>
                    작성시간:{" "}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "-"}
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <div className="flex items-center space-x-2">
                    {user &&
                      (user.role === "ADMIN" ||
                        String(user.id) === String(item.authorId) ||
                        String(user.uid) === String(item.authorId) ||
                        user.username === item.authorName) && (
                        <>
                          <button
                            onClick={() =>
                              navigate(`/market/edit/${item.itemId || item.id}`)
                            }
                            className="text-blue-500 hover:text-blue-700 border border-black px-2 py-1 rounded"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(item.itemId || item.id)}
                            className="text-red-500 hover:text-red-700 border border-black px-2 py-1 rounded"
                          >
                            삭제
                          </button>
                        </>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
