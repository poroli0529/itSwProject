import React from "react";
import "./../css/MarketPage.css";
import logo from "../image/logo192.png";

const MarketPage = () => {
  // 더미 데이터 (12개)
  const dummyProducts = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `상품 ${i + 1}`,
    price: `${(i + 1) * 1000}원`,
    desc: `이것은 ${i + 1}번째 상품의 설명입니다.`,
    img : logo,
  }));

  // 행(row) 단위로 데이터 쪼개기 (3개씩)
  const rows = [];
  for (let i = 0; i < dummyProducts.length; i += 3) {
    rows.push(dummyProducts.slice(i, i + 3));
  }

  return (
    <div className="market-container">
      <div className="MarketHeader">
        <div className="header-content"> {/* 새로운 컨테이너 추가 */}
          <h1>거래 페이지</h1>

          {/* 버튼 영역 */}
          <div className="market-buttons">
            <button className="buy-btn">구매 신청</button>
            <button className="sell-btn">판매 신청</button>
          </div>
        </div>

      </div>
      

      {/* 상품 테이블 */}
      <table className="product-table">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((item) => (
                <td key={item.id} className="product-cell">
                  <img src={item.img} alt={item.name} />
                  <h3>{item.name}</h3>  
                  <p>{item.desc}</p>
                  <strong>{item.price}</strong>
              
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};





export default MarketPage;
