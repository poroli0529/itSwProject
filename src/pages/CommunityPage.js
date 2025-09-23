import { useState } from "react";
import "./../css/Community.css";
const CommunityPage = () => {
  // 임시 데이터 (DB 연동 전까지는 useState로 관리)
  const [posts, setPosts] = useState([
    { id: 1, title: "첫 번째 글", content: "안녕하세요!", date: "2025-09-22" },
    { id: 2, title: "중간고사까지 벌써 3주...", content: "공부한게 없는 것 같은데 어쩌지..!!", date: "2025-09-21" },
    { id: 3, title: "자유게시판 글", content: "오늘 날씨 좋네요", date: "2025-09-20" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  // 검색 필터
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 정렬 적용
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  // 글 등록
  const handleAddPost = (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    const newEntry = {
      id: posts.length + 1,
      title: newPost.title,
      content: newPost.content,
      date: new Date().toISOString().split("T")[0],
    };

    setPosts([newEntry, ...posts]);
    setNewPost({ title: "", content: "" }); // 입력창 초기화
  };

  return (
    <div className="community-container">
      <h1>커뮤니티 페이지</h1>

      {/* 검색창 */}
      <input
        type="text"
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 정렬 */}
      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="newest">최신순</option>
        <option value="oldest">오래된순</option>
      </select>
      <br/>
      {/* 글 등록 */}
      <form onSubmit={handleAddPost} className="post-form">
        <input
          type="text"
          placeholder="제목"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <br/>
        <textarea 
          className="contents"
          placeholder="내용"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        />
        <button type="submit">글 등록</button>
      </form>

      {/* 게시글 목록 */}
      <ul className="post-list">
        {sortedPosts.map((post) => (
          <li key={post.id} className="post-item">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>{post.date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityPage;
