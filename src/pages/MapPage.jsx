// ✅ 로고 이미지
import title from "../images/title.png";
import logo from "../images/logo.png";

export default function MapPage() {
  return (
    <div className="p-8 text-center bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
        <img
          src={logo}
          alt="Title"
          className="inline-block h-16 w-auto mr-3 align-middle"
        />
        {/* 이미지 태그를 h1태그와 나란히 하게 출력해주는 코드입니다.  이미지 - 글 - 이미지 형태*/}
        <span className="align-middle">인하공전 캠퍼스 지도 </span>
        <img
          src={logo}
          alt="Title"
          className="inline-block h-16 w-auto mr-3 align-middle"
        />
      </h1>
      <p className="text-gray-600 mb-6">
        이 페이지는 로그인 없이 누구나 접근할 수 있는 기본 홈 화면입니다.
      </p>
      <div className="bg-white shadow-md p-6 rounded-xl max-w-3xl mx-auto border border-gray-200">
        <p className="text-gray-500 text-lg">
          여기에 나중에 실제 <strong>지도 API</strong> (예: Kakao Maps, Naver
          Maps, Google Maps 등)을 연동할 수 있습니다.
        </p>
        <p className="mt-4 text-sm text-gray-400">
          현재는 데모용 안내 화면입니다.
        </p>
      </div>
    </div>
  );
}
