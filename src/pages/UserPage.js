// pages/UserPage.js
const UserPage = () => {

    const mockdata =  [
        {
          name: "이승종",
          departure: "컴퓨터정보과",
          stdno: "202244083",
        },
        {
          name: "이승종",
          departure: "컴퓨터정보과",
          stdno: "202244084",
        }
        
    ];
      
       
  
  return (
    <div>
      <div>
      
      <h1>사용자 페이지</h1>
      <ul>
        {mockdata
        .filter(user => user.stdno === "202244083")
        .map((user,index)=>(
            
          <li key={index}>
            이름: {user.name} <br/>학과: {user.departure}<br/> 학번: {user.stdno}<br/>
          </li>
        ))}
      </ul>
     
    </div>
    
   


      <h4>내가 쓴 글</h4>

        날짜 + 제목 구성으로 데이터베이스에서 글가져오기

      <h4>내가 등록한 물건</h4>
      
      등록날짜 + 사진 + 제목 구성으로 데이터베이스에서 상품 정보 가져오기

    </div>
  );
};

export default UserPage;
