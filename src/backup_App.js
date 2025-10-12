// Inha Technical College Community Demo Web Page (React + Firestore)
// 지도, 커뮤니티, 중고거래 장터 기능을 포함하는 단일 파일 React 애플리케이션 데모입니다.
// 모든 데이터는 Firestore에 저장되며, 커뮤니티와 중고거래 장터는 로그인 후에만 접근 가능합니다.
import './index.css';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged, 
    signOut 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    onSnapshot, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp,
    getDocs, // Dummy data population에 사용
    writeBatch // Dummy data population에 사용
} from 'firebase/firestore';

const YOUR_FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY", // <--- 당신의 API 키로 변경
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // <--- 당신의 Auth 도메인으로 변경
  projectId: "YOUR_PROJECT_ID", // <--- 당신의 프로젝트 ID로 변경
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // <--- 당신의 스토리지 버킷으로 변경
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- 당신의 메시징 ID로 변경
  appId: "YOUR_APP_ID" // <--- 당신의 앱 ID로 변경
};
// *****************************************************************

// Canvas 환경 변수 대신 실제 설정으로 대체합니다.
const appId = YOUR_FIREBASE_CONFIG.projectId; 
const firebaseConfig = YOUR_FIREBASE_CONFIG;
const initialAuthToken = null; // 로컬 환경에서는 자동 인증 토큰을 사용하지 않습니다.

// Firebase App 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 게시판 타입 정의
const BOARD_TYPES = {
    FREE: 'free',
    CLUB: 'club',
    PROMOTION: 'promotion'
};

const CLUB_DETAILS = {
    'computer': { name: '컴퓨터 공학과', icon: '💻' },
    'dance': { name: '댄스', icon: '💃' },
    'climbing': { name: '클라이밍', icon: '🧗' }
};

const PRODUCT_STATUS = {
    SELLING: '판매중',
    SOLD: '판매완료'
};

// --- Dummy Data Generation Functions ---

// Mock Timestamp를 생성하여 Firestore Timestamp 객체를 시뮬레이션합니다.
const mockTimestamp = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return {
        toDate: () => d,
        toMillis: () => d.getTime(),
        // Firestore serverTimestamp()를 시뮬레이션하기 위한 임시 마커
        isMock: true, 
        mockDate: d
    };
};

const generateDummyPosts = (authorId, authorName) => {
    const generalPostContent = (title, board) => 
        `안녕하세요! 이 글은 ${board}에 작성된 테스트 게시글입니다. 제목은 "${title}"이며, 이 내용은 다른 사용자들이 작성하는 게시글의 형태를 모방한 것입니다. 활발한 커뮤니티 활동 기대합니다.\n\n---\n\n(본문 내용)\n\n학교 커뮤니티가 활성화되길 바라며, 글쓰기 양식은 자유롭게 작성해주세요. 사진 첨부나 외부 링크 공유도 가능합니다. 다만, 욕설이나 비방 등은 제재 대상입니다.`;

    let posts = [];
    let postIdCounter = 1;

    // 1. 자유 게시판 (4개)
    for (let i = 0; i < 4; i++) {
        posts.push({
            id: `mock-free-${postIdCounter++}`,
            title: `[자유] 학식 메뉴 추천 및 평가 (${4 - i}일 전)`,
            content: generalPostContent(`학식 메뉴 추천 및 평가 (${4 - i}일 전)`, '자유게시판'),
            authorId: 'mock-user-free',
            authorName: '자유게시자',
            boardType: BOARD_TYPES.FREE,
            timestamp: mockTimestamp(i * 2 + 1),
        });
    }

    // 2. 홍보 게시판 (4개)
    for (let i = 0; i < 4; i++) {
        posts.push({
            id: `mock-promo-${postIdCounter++}`,
            title: `[홍보] 2024년 가을 축제 'ITF' 참가 부스 모집 안내 (${4 - i}일 전)`,
            content: generalPostContent(`2024년 가을 축제 'ITF' 참가 부스 모집 안내 (${4 - i}일 전)`, '홍보게시판'),
            authorId: 'mock-user-promo',
            authorName: '홍보팀_IT',
            boardType: BOARD_TYPES.PROMOTION,
            timestamp: mockTimestamp(i + 1),
        });
    }

    // 3. 동아리 게시판 (3개 동아리 * 4개 = 12개)
    const clubTitles = [
        '2025년 모집계획 발표',
        '2025 활동 발표',
        '2024 모집계획 발표',
        '2024 활동 발표',
    ];

    Object.entries(CLUB_DETAILS).forEach(([key, club], clubIndex) => {
        clubTitles.forEach((title, titleIndex) => {
            const daysAgo = clubIndex * 5 + titleIndex + 1;
            const content = `[${club.name} 동아리] 안녕하세요, ${club.name} 동아리 담당자입니다. 저희 동아리의 **${title}**에 대해 다음과 같이 안내드립니다.\n\n작년 활동을 기반으로 더욱 알찬 ${title.includes('모집') ? '신입 모집' : '활동 계획'}을 준비했습니다. 상세 내용은 아래와 같습니다.\n\n[세부 내용]\n- ${title.includes('2025') ? '새로운' : '기존'} 커리큘럼 도입\n- 정기 모임: 매주 수요일 18시\n- 문의: ${club.name.replace(/\s+/g, '')} 공식 연락처\n\n많은 관심 부탁드립니다!`;
            
            posts.push({
                id: `mock-club-${key}-${postIdCounter++}`,
                title: `[${club.name}] ${title}`,
                content: content,
                authorId: `mock-user-${key}`,
                authorName: `${club.name.substring(0, 3)}운영진`,
                boardType: `club-${key}`, // e.g., 'club-computer'
                timestamp: mockTimestamp(daysAgo),
            });
        });
    });

    return posts;
};

// --- Icons (using inline SVG for simplicity) ---
const MapIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const CommunityIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-5c0-.6-.4-1-1-1h-1V3c0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1v14h2"/><path d="M12 21h3"/><path d="M16 21v-3"/><path d="M8 21h3"/><path d="M7 17v-1.5c0-.4.3-.7.7-.7h10.6c.4 0 .7.3.7.7V17"/></svg>
);
const MarketIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v12a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><path d="M12 6v6m0-6h6m-6 0H6"/></svg>
);
const PlusIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m7-7H5"/></svg>
);
const TrashIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3-3h8l-1-3H8l-1 3z"/></svg>
);
const EditIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
);
const BackIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7 7l-7-7 7-7"/></svg>
);
const SendIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13m-3 3-3 3 17-17z"/></svg>
);

// --- Utility Functions ---
const formatTimestamp = (timestamp) => {
    if (!timestamp) return '시간 정보 없음';
    try {
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleDateString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit', 
                hour: '2-digit', minute: '2-digit'
            });
        }
    } catch (e) {
        console.error("Timestamp formatting error:", e);
    }
    return new Date().toLocaleDateString('ko-KR');
};

const PostItem = ({ post, onClick, currentUserId }) => {
    const isAuthor = currentUserId === post.authorId;
    return (
        <div 
            className="flex justify-between items-center p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition duration-150 ease-in-out"
            onClick={() => onClick(post)}
        >
            <div className="flex-grow min-w-0">
                <p className="font-semibold text-lg text-gray-800 truncate">{post.title}</p>
                <div className="text-sm text-gray-500 mt-1 flex items-center space-x-3">
                    <span className='font-medium'>{post.authorName}</span>
                    <span>|</span>
                    <span>{formatTimestamp(post.timestamp)}</span>
                    {isAuthor && <span className="text-xs text-blue-500 border border-blue-200 px-1 rounded">내 글</span>}
                </div>
            </div>
        </div>
    );
};

// --- Page Components ---

// 1. 지도 페이지 (MapPage) - 로그인 불필요
const MapPage = () => {
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-blue-500 pb-2">
                    <MapIcon className="inline w-8 h-8 mr-2 text-blue-600"/>
                    인하공업전문대학교 캠퍼스 지도
                </h2>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <p className="text-gray-700 mb-4 font-semibold">
                        * 이 페이지는 누구나 자유롭게 이용 가능합니다. *
                    </p>
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center text-gray-500 font-bold text-xl border-4 border-dashed border-gray-400">
                        
                        <span className='p-4 text-center'>
                            (데모 버전: 실제 지도 API 연동 공간)
                            <br/>
                            건물 위치, 강의실, 편의시설 등을 검색하고 확인할 수 있는 기능을 여기에 구현할 수 있습니다.
                        </span>
                    </div>
                </div>

                <div className="mt-8 grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-500">
                        <h3 className="font-bold text-xl text-blue-700 mb-2">🏫 주요 건물 안내</h3>
                        <ul className="text-gray-600 text-sm list-disc pl-5">
                            <li>본관 (B1)</li>
                            <li>정보센터 (IS)</li>
                            <li>하이테크관 (HT)</li>
                        </ul>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-500">
                        <h3 className="font-bold text-xl text-blue-700 mb-2">🍽️ 편의 시설</h3>
                        <ul className="text-gray-600 text-sm list-disc pl-5">
                            <li>학생 식당</li>
                            <li>카페 (파고다홀)</li>
                            <li>서점/문구점</li>
                        </ul>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-500">
                        <h3 className="font-bold text-xl text-blue-700 mb-2">📍 찾아오시는 길</h3>
                        <p className="text-gray-600 text-sm">
                            인천광역시 미추홀구 인하로 100
                            <br/>(인하대역 2번 출구 이용)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Post Detail / Form Component
const PostEditor = ({ post, boardType, onSave, onCancel, onDelete, userId, authorName }) => {
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');
    const isEdit = !!post;
    const isAuthor = post && post.authorId === userId;

    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            // Note: Replaced alert with console.error as per instructions
            console.error("제목과 내용을 입력해주세요."); 
            return;
        }
        onSave({ 
            ...post,
            title, 
            content, 
            boardType,
            authorId: isEdit ? post.authorId : userId,
            authorName: isEdit ? post.authorName : authorName,
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto mt-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                {isEdit ? '게시글 수정' : '새 게시글 작성'}
            </h3>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
                <textarea
                    placeholder="내용을 입력하세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="10"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
                />
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150 mr-3"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150"
                    >
                        {isEdit ? '수정 완료' : '작성 완료'}
                    </button>
                </div>
                {isEdit && isAuthor && (
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-150 flex items-center"
                    >
                        <TrashIcon className="w-5 h-5 mr-1"/> 삭제
                    </button>
                )}
            </div>
        </div>
    );
};

const PostDetail = ({ post, onBack, onEdit, onDelete, userId }) => {
    const isAuthor = userId === post.authorId;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto mt-4">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
                <h2 className="text-3xl font-extrabold text-gray-900">{post.title}</h2>
                <button
                    onClick={onBack}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition duration-150 font-medium"
                >
                    <BackIcon className="w-5 h-5 mr-1"/> 목록으로
                </button>
            </div>
            <div className="text-sm text-gray-500 mb-6 flex justify-between items-center border-b pb-3">
                <div className="space-x-4">
                    <span>게시자: <strong className="text-gray-700">{post.authorName}</strong></span>
                    <span>|</span>
                    <span>게시시간: {formatTimestamp(post.timestamp)}</span>
                </div>
                {isAuthor && (
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => onEdit(post)}
                            className="text-blue-500 hover:text-blue-700 flex items-center"
                        >
                            <EditIcon className="w-4 h-4 mr-1"/> 수정
                        </button>
                        <button 
                            onClick={() => onDelete(post)}
                            className="text-red-500 hover:text-red-700 flex items-center"
                        >
                            <TrashIcon className="w-4 h-4 mr-1"/> 삭제
                        </button>
                    </div>
                )}
            </div>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[200px]">
                {post.content}
            </div>
        </div>
    );
};

// 2. 커뮤니티 페이지 (CommunityPage) - 로그인 필수
const ClubSelection = ({ onSelectClub }) => (
    <div className="grid md:grid-cols-3 gap-6 mt-8">
        {Object.entries(CLUB_DETAILS).map(([key, club]) => (
            <div 
                key={key} 
                onClick={() => onSelectClub(`club-${key}`)}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer text-center border-t-8 border-blue-500 transform hover:scale-[1.02]"
            >
                <div className="text-6xl mb-4">{club.icon}</div>
                <h3 className="text-xl font-bold text-gray-800">{club.name} 동아리 게시판</h3>
                <p className="text-sm text-gray-500 mt-2">클릭하여 해당 동아리 글을 확인하세요.</p>
            </div>
        ))}
    </div>
);

const CommunityPage = ({ 
    posts, 
    onAddPost, 
    onDeletePost, 
    onUpdatePost, 
    userId, 
    authorName, 
    currentBoard, 
    setCurrentBoard,
    postToEdit,
    setPostToEdit
}) => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'form', 'edit'
    const [selectedPost, setSelectedPost] = useState(null);

    // Filter posts based on current board and sort by timestamp (descending, in-memory sorting)
    const filteredPosts = useMemo(() => {
        let filtered = posts.filter(p => {
            if (currentBoard === BOARD_TYPES.CLUB) {
                // For the main club page, show no posts or redirect
                return false; 
            }
            return p.boardType === currentBoard;
        });
        
        // Handle club-specific boards (e.g., 'club-computer')
        if (currentBoard.startsWith('club-')) {
            filtered = posts.filter(p => p.boardType === currentBoard);
        }

        // Sort in memory (descending order)
        return filtered.sort((a, b) => {
            const timeA = a.timestamp?.toMillis() || 0;
            const timeB = b.timestamp?.toMillis() || 0;
            return timeB - timeA;
        });
    }, [posts, currentBoard]);

    const handleSelectPost = (post) => {
        setSelectedPost(post);
        setViewMode('detail');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedPost(null);
        setPostToEdit(null);
    };

    const handleEdit = (post) => {
        setPostToEdit(post);
        setViewMode('edit');
    };

    const handleDelete = async (post) => {
        // Note: Replaced window.confirm with console.log for a custom modal demo
        console.log(`[Custom Modal] Confirm deletion of post: ${post.title}`);
        if (window.confirm(`정말로 '[${post.title}]' 게시글을 삭제하시겠습니까?`)) {
            await onDeletePost(post.id);
            handleBackToList();
        }
    };
    
    // Determine title and description based on the current board
    const getBoardInfo = () => {
        if (currentBoard === BOARD_TYPES.FREE) return { title: '자유 게시판', desc: '학교 생활에 대한 자유로운 이야기를 나눠보세요.' };
        if (currentBoard === BOARD_TYPES.PROMOTION) return { title: '홍보 게시판', desc: '다양한 행사, 정보, 광고 등을 홍보하는 공간입니다.' };
        if (currentBoard === BOARD_TYPES.CLUB) return { title: '동아리 게시판', desc: '3개의 대표 동아리 중 하나를 선택하여 게시판으로 이동하세요.' };
        if (currentBoard.startsWith('club-')) {
            const clubKey = currentBoard.split('-')[1];
            const club = CLUB_DETAILS[clubKey];
            return { title: `${club.name} 동아리 게시판`, desc: `${club.name} 동아리 관련 소식을 공유합니다.` };
        }
        return { title: '커뮤니티', desc: '게시판을 선택하세요.' };
    };
    const boardInfo = getBoardInfo();


    // --- Render Logic ---
    let content;

    if (viewMode === 'form' || viewMode === 'edit') {
        content = (
            <PostEditor
                post={postToEdit}
                boardType={currentBoard}
                onSave={async (data) => {
                    if (viewMode === 'edit') {
                        await onUpdatePost(data);
                    } else {
                        await onAddPost(data);
                    }
                    handleBackToList();
                }}
                onCancel={handleBackToList}
                onDelete={postToEdit ? () => handleDelete(postToEdit) : null}
                userId={userId}
                authorName={authorName}
            />
        );
    } else if (viewMode === 'detail' && selectedPost) {
        content = (
            <PostDetail
                post={selectedPost}
                onBack={handleBackToList}
                onEdit={handleEdit}
                onDelete={handleDelete}
                userId={userId}
            />
        );
    } else { // 'list' mode
        content = (
            <>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-700">{boardInfo.desc}</h3>
                    {currentBoard !== BOARD_TYPES.CLUB && (
                        <button
                            onClick={() => {
                                setPostToEdit(null);
                                setViewMode('form');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition duration-150 flex items-center shadow-lg"
                        >
                            <PlusIcon className="w-5 h-5 mr-1"/> 글 작성
                        </button>
                    )}
                </div>
                
                {currentBoard === BOARD_TYPES.CLUB ? (
                    <ClubSelection onSelectClub={setCurrentBoard} />
                ) : (
                    <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-100">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map(post => (
                                <PostItem 
                                    key={post.id} 
                                    post={post} 
                                    onClick={handleSelectPost} 
                                    currentUserId={userId}
                                />
                            ))
                        ) : (
                            <p className="p-8 text-center text-gray-500">
                                {boardInfo.title}에 게시글이 없습니다. 첫 글을 작성해보세요!
                            </p>
                        )}
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-blue-500 pb-2">
                    <CommunityIcon className="inline w-8 h-8 mr-2 text-blue-600"/>
                    {boardInfo.title}
                </h2>
                
                {/* Board Navigation Tabs */}
                <div className="flex space-x-2 md:space-x-4 mb-6 p-2 bg-white rounded-lg shadow-inner overflow-x-auto">
                    {[
                        { key: BOARD_TYPES.FREE, label: '자유 게시판' },
                        { key: BOARD_TYPES.CLUB, label: '동아리 게시판' },
                        { key: BOARD_TYPES.PROMOTION, label: '홍보 게시판' }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => {
                                setCurrentBoard(key);
                                handleBackToList();
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition duration-150 ${
                                currentBoard.startsWith(key) 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'text-gray-600 hover:bg-blue-100'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                    {currentBoard.startsWith('club-') && (
                        <button
                            onClick={() => setCurrentBoard(currentBoard)}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-blue-100 text-blue-700 shadow-md`}
                        >
                            {CLUB_DETAILS[currentBoard.split('-')[1]].name} 상세
                        </button>
                    )}
                </div>

                {content}
            </div>
        </div>
    );
};

// 3. 중고거래 장터 페이지 (MarketPage) - 로그인 필수
const ProductEditor = ({ product, onSave, onCancel, userId, authorName }) => {
    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.price || '');
    const [description, setDescription] = useState(product?.description || '');
    const isEdit = !!product;

    const handleSave = () => {
        if (!name.trim() || !price || !description.trim()) {
            console.error("상품명, 가격, 설명을 모두 입력해주세요.");
            return;
        }
        if (isNaN(Number(price)) || Number(price) < 0) {
            console.error("유효한 가격을 입력해주세요.");
            return;
        }

        onSave({ 
            ...product,
            name, 
            price: Number(price), 
            description,
            status: product?.status || PRODUCT_STATUS.SELLING, // Default to Selling
            authorId: isEdit ? product.authorId : userId,
            authorName: isEdit ? product.authorName : authorName,
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl mx-auto mt-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                {isEdit ? '상품 수정' : '새 상품 게시'}
            </h3>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="상품명"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
                <input
                    type="number"
                    placeholder="가격 (원)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
                <textarea
                    placeholder="상품 설명"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="6"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
                />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150"
                >
                    취소
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150"
                >
                    {isEdit ? '수정 완료' : '게시 완료'}
                </button>
            </div>
        </div>
    );
};

const ProductItem = ({ product, onClick }) => {
    const statusColor = product.status === PRODUCT_STATUS.SOLD ? 'bg-red-500' : 'bg-green-500';

    return (
        <div 
            className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 border border-gray-100"
            onClick={() => onClick(product)}
        >
            <div className="w-full md:w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0">
                
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xl font-bold text-gray-900 truncate pr-4">{product.name}</h4>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${statusColor} flex-shrink-0`}>
                        {product.status}
                    </span>
                </div>
                <p className="text-blue-600 text-xl font-extrabold mb-2">{product.price.toLocaleString()} 원</p>
                <div className="text-sm text-gray-500 space-x-3">
                    <span>작성자: {product.authorName}</span>
                    <span>|</span>
                    <span>{formatTimestamp(product.timestamp)}</span>
                </div>
            </div>
        </div>
    );
};

const ProductDetail = ({ product, comments, onBack, onStatusChange, onDelete, onAddComment, userId, authorName }) => {
    const [commentText, setCommentText] = useState('');
    const isAuthor = userId === product.authorId;

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;
        await onAddComment(product.id, commentText);
        setCommentText('');
    };
    
    // Sort comments by timestamp (ascending)
    const sortedComments = comments.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
                {/* Left/Center: Product Info */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-start mb-4 border-b pb-4">
                        <h2 className="text-3xl font-extrabold text-gray-900">{product.name}</h2>
                        <button
                            onClick={onBack}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition duration-150 font-medium whitespace-nowrap"
                        >
                            <BackIcon className="w-5 h-5 mr-1"/> 목록으로
                        </button>
                    </div>

                    <div className="flex items-center space-x-4 mb-6">
                        <span className={`text-lg font-bold px-3 py-1 rounded-full text-white ${product.status === PRODUCT_STATUS.SOLD ? 'bg-red-500' : 'bg-green-500'}`}>
                            {product.status}
                        </span>
                        <p className="text-3xl font-extrabold text-blue-600">{product.price.toLocaleString()} 원</p>
                    </div>

                    <div className="text-sm text-gray-500 mb-6 border-b pb-4">
                        <p>작성자(학번): <strong className="text-gray-700">{product.authorName}</strong></p>
                        <p>게시시간: {formatTimestamp(product.timestamp)}</p>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-3">상품 상세 설명</h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[150px] mb-8 p-4 bg-gray-50 rounded-lg">
                        {product.description}
                    </div>

                    {isAuthor && (
                        <div className="flex space-x-3 justify-end mt-4">
                            <button
                                onClick={() => onStatusChange(product.status === PRODUCT_STATUS.SELLING ? PRODUCT_STATUS.SOLD : PRODUCT_STATUS.SELLING)}
                                className={`px-4 py-2 font-semibold rounded-lg transition duration-150 ${
                                    product.status === PRODUCT_STATUS.SELLING 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                            >
                                {product.status === PRODUCT_STATUS.SELLING ? '판매 완료로 변경' : '판매 중으로 변경'}
                            </button>
                            {/* <button
                                onClick={() => {/* Implement Edit Logic */ /*}}
                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-150 flex items-center"
                            >
                                <EditIcon className="w-5 h-5 mr-1"/> 수정
                            </button> */}
                            <button
                                onClick={() => onDelete(product)}
                                className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition duration-150 flex items-center"
                            >
                                <TrashIcon className="w-5 h-5 mr-1"/> 삭제
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Comment/Chat Window */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-lg flex flex-col h-[600px] lg:h-auto">
                    <h3 className="text-xl font-bold text-gray-800 p-4 border-b">💬 대화창 (댓글)</h3>
                    <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                        {sortedComments.length > 0 ? (
                            sortedComments.map(comment => (
                                <div 
                                    key={comment.id} 
                                    className={`p-3 rounded-xl max-w-[80%] ${
                                        comment.authorId === userId 
                                            ? 'bg-blue-100 ml-auto text-right' 
                                            : 'bg-gray-100 mr-auto text-left'
                                    }`}
                                >
                                    <p className="text-xs font-semibold mb-1">
                                        {comment.authorName}
                                        <span className="text-gray-500 ml-2">({formatTimestamp(comment.timestamp)})</span>
                                    </p>
                                    <p className="text-sm">{comment.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 text-sm mt-10">첫 대화를 시작해보세요!</p>
                        )}
                    </div>
                    <div className="p-4 border-t flex space-x-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="메시지를 입력하세요..."
                            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                        />
                        <button
                            onClick={handleCommentSubmit}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 flex items-center"
                        >
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const MarketPage = ({ products, comments, onAddProduct, onUpdateProduct, onDeleteProduct, onAddComment, userId, authorName }) => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'form'
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Sort products by timestamp (descending, in-memory sorting)
    const sortedProducts = useMemo(() => {
        return products.sort((a, b) => {
            const timeA = a.timestamp?.toMillis() || 0;
            const timeB = b.timestamp?.toMillis() || 0;
            return timeB - timeA;
        });
    }, [products]);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setViewMode('detail');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedProduct(null);
    };

    const handleDelete = async (product) => {
        // Note: Replaced window.confirm with console.log for a custom modal demo
        console.log(`[Custom Modal] Confirm deletion of product: ${product.name}`);
        if (window.confirm(`정말로 상품 '[${product.name}]'을 삭제하시겠습니까?`)) {
            await onDeleteProduct(product.id);
            handleBackToList();
        }
    };

    const handleStatusChange = async (status) => {
        if (selectedProduct) {
            await onUpdateProduct({ ...selectedProduct, status });
        }
    };

    const filteredComments = selectedProduct 
        ? comments.filter(c => c.productId === selectedProduct.id) 
        : [];

    let content;

    if (viewMode === 'form') {
        content = (
            <ProductEditor
                onSave={async (data) => {
                    await onAddProduct(data);
                    handleBackToList();
                }}
                onCancel={handleBackToList}
                userId={userId}
                authorName={authorName}
            />
        );
    } else if (viewMode === 'detail' && selectedProduct) {
        content = (
            <ProductDetail
                product={selectedProduct}
                comments={filteredComments}
                onBack={handleBackToList}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onAddComment={onAddComment}
                userId={userId}
                authorName={authorName}
            />
        );
    } else { // 'list' mode
        content = (
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setViewMode('form')}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition duration-150 flex items-center shadow-lg transform hover:scale-[1.05]"
                    >
                        <PlusIcon className="w-5 h-5 mr-1"/> 상품 게시
                    </button>
                </div>

                <div className="space-y-4">
                    {sortedProducts.length > 0 ? (
                        sortedProducts.map(product => (
                            <ProductItem 
                                key={product.id} 
                                product={product} 
                                onClick={handleSelectProduct} 
                            />
                        ))
                    ) : (
                        <div className="bg-white p-8 rounded-xl shadow-lg text-center text-gray-500">
                            게시된 중고 상품이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-blue-500 pb-2">
                    <MarketIcon className="inline w-8 h-8 mr-2 text-blue-600"/>
                    중고거래 장터
                </h2>
                
                {viewMode === 'list' && <p className='text-gray-600 mb-6 max-w-4xl mx-auto'>인하공전 학생들 간의 중고 물품을 안전하게 거래하세요.</p>}

                {content}
            </div>
        </div>
    );
};


// --- Main Application Component ---
const App = () => {
    const [currentPage, setCurrentPage] = useState('map');
    const [authReady, setAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);
    const [authorName, setAuthorName] = useState(''); // User's display name/student ID
    const [posts, setPosts] = useState([]);
    const [products, setProducts] = useState([]);
    const [comments, setComments] = useState([]);
    
    // Community-specific state
    const [currentBoard, setCurrentBoard] = useState(BOARD_TYPES.FREE);
    const [postToEdit, setPostToEdit] = useState(null);

    // 1. Authentication and Firebase Setup
    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase authentication failed:", error);
            }
        };

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                // In a real app, user data (like student ID) would be fetched from Firestore
                // or token claims. Here we use the UID for demonstration.
                setAuthorName(user.uid.substring(0, 8)); // Mock student ID/author name
            } else {
                setUserId(null);
                setAuthorName('');
            }
            setAuthReady(true);
        });

        initializeFirebase();
        return () => unsubscribeAuth();
    }, []);

    const isLoggedIn = !!userId && authReady;

    // 2. Data Fetching (Posts, Products, Comments)
    useEffect(() => {
        // Firestore 리스너는 authReady 상태가 true이고, userId가 유효할 때만 시작합니다.
        if (!authReady || !userId) return;

        // Posts Listener
        const postsRef = collection(db, `/artifacts/${appId}/public/data/inha_posts`);
        const qPosts = query(postsRef);
        const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(fetchedPosts);
        }, (error) => console.error("Error fetching posts:", error));

        // Products Listener
        const productsRef = collection(db, `/artifacts/${appId}/public/data/inha_products`);
        const qProducts = query(productsRef);
        const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
            const fetchedProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(fetchedProducts);
        }, (error) => console.error("Error fetching products:", error));

        // Comments Listener
        const commentsRef = collection(db, `/artifacts/${appId}/public/data/inha_product_comments`);
        const qComments = query(commentsRef);
        const unsubscribeComments = onSnapshot(qComments, (snapshot) => {
            const fetchedComments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(fetchedComments);
        }, (error) => console.error("Error fetching comments:", error));

        return () => {
            unsubscribePosts();
            unsubscribeProducts();
            unsubscribeComments();
        };
    }, [authReady, userId]); // userId를 의존성 배열에 추가하여 인증 후 실행을 보장

    // 3. Populate Dummy Data if Collections are Empty
    useEffect(() => {
        const populateFirestoreWithDummyData = async () => {
            // **수정**: userId가 유효할 때만 더미 데이터 삽입 시도
            if (!userId) {
                console.log("Waiting for user authentication before populating dummy data...");
                return;
            }
            
            const postsRef = collection(db, `/artifacts/${appId}/public/data/inha_posts`);
            
            try {
                // Check if the posts collection is empty
                const snapshot = await getDocs(postsRef);
                if (!snapshot.empty) {
                    console.log("Posts collection already contains data. Skipping dummy data population.");
                    return;
                }

                console.log("Posts collection is empty. Populating with dummy data...");
                const dummyPosts = generateDummyPosts(userId, authorName);
                const batch = writeBatch(db);

                dummyPosts.forEach(post => {
                    // Firestore serverTimestamp() 대신 mockDate를 사용하여 초기 데이터의 타임스탬프를 설정
                    const docRef = doc(postsRef);
                    batch.set(docRef, {
                        title: post.title,
                        content: post.content,
                        authorId: post.authorId,
                        authorName: post.authorName,
                        boardType: post.boardType,
                        timestamp: post.timestamp.mockDate || serverTimestamp(),
                    });
                });

                await batch.commit();
                console.log(`Successfully added ${dummyPosts.length} dummy posts.`);

            } catch (error) {
                console.error("Error populating dummy data:", error);
            }
        };

        if (authReady) {
            populateFirestoreWithDummyData();
        }
    }, [authReady, userId, authorName]); // userId를 의존성 배열에 추가하여 인증 후 실행을 보장

    // --- Data Manipulation Functions ---

    // Posts CUD
    const handleAddPost = async (postData) => {
        if (!userId) return console.error("게시글을 작성하려면 로그인해야 합니다.");
        try {
            await addDoc(collection(db, `/artifacts/${appId}/public/data/inha_posts`), {
                ...postData,
                timestamp: serverTimestamp(),
            });
            console.log("Post added successfully.");
        } catch (e) {
            console.error("Error adding post: ", e);
        }
    };

    const handleUpdatePost = async (postData) => {
        if (!userId) return console.error("게시글을 수정하려면 로그인해야 합니다.");
        try {
            const postRef = doc(db, `/artifacts/${appId}/public/data/inha_posts`, postData.id);
            // Only update title and content
            await updateDoc(postRef, {
                title: postData.title,
                content: postData.content,
                updatedAt: serverTimestamp(),
            });
            console.log("Post updated successfully.");
        } catch (e) {
            console.error("Error updating post: ", e);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!userId) return console.error("게시글을 삭제하려면 로그인해야 합니다.");
        try {
            await deleteDoc(doc(db, `/artifacts/${appId}/public/data/inha_posts`, postId));
            console.log("Post deleted successfully.");
        } catch (e) {
            console.error("Error deleting post: ", e);
        }
    };

    // Products CUD
    const handleAddProduct = async (productData) => {
        if (!userId) return console.error("상품을 게시하려면 로그인해야 합니다.");
        try {
            await addDoc(collection(db, `/artifacts/${appId}/public/data/inha_products`), {
                ...productData,
                timestamp: serverTimestamp(),
            });
            console.log("Product added successfully.");
        } catch (e) {
            console.error("Error adding product: ", e);
        }
    };

    const handleUpdateProduct = async (productData) => {
        if (!userId) return console.error("상품을 수정하려면 로그인해야 합니다.");
        try {
            const productRef = doc(db, `/artifacts/${appId}/public/data/inha_products`, productData.id);
            // Update all fields (including status for status change)
            await updateDoc(productRef, productData);
            console.log("Product updated successfully.");
        } catch (e) {
            console.error("Error updating product: ", e);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!userId) return console.error("상품을 삭제하려면 로그인해야 합니다.");
        try {
            await deleteDoc(doc(db, `/artifacts/${appId}/public/data/inha_products`, productId));
            // Optionally delete related comments as well (omitted for demo simplicity)
            console.log("Product deleted successfully.");
        } catch (e) {
            console.error("Error deleting product: ", e);
        }
    };

    // Comments C
    const handleAddComment = async (productId, content) => {
        if (!userId) return console.error("댓글을 작성하려면 로그인해야 합니다.");
        try {
            await addDoc(collection(db, `/artifacts/${appId}/public/data/inha_product_comments`), {
                productId,
                content,
                authorId: userId,
                authorName: authorName,
                timestamp: serverTimestamp(),
            });
            console.log("Comment added successfully.");
        } catch (e) {
            console.error("Error adding comment: ", e);
        }
    };

    // --- Navigation and View Selection ---
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setCurrentPage('map');
            console.log("User signed out.");
        } catch (e) {
            console.error("Error signing out:", e);
        }
    };

    const navigate = (page) => {
        if (!isLoggedIn && (page === 'community' || page === 'market')) {
            // Cannot navigate to gated page without login
            // Using console.error for simple access restriction in the demo environment
            console.error('로그인 후 이용 가능한 서비스입니다.'); 
            // In a real app, this would trigger a modal or redirect to a login page.
        } else {
            setCurrentPage(page);
        }
    };

    const renderPage = () => {
        if (!authReady) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="text-xl font-semibold text-gray-700 p-8 rounded-lg shadow-lg bg-white">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3 inline-block"></div>
                        인증 정보 로딩 중...
                    </div>
                </div>
            );
        }
        
        switch (currentPage) {
            case 'map':
                return <MapPage />;
            case 'community':
                if (!isLoggedIn) return <AuthWall />;
                return (
                    <CommunityPage
                        posts={posts}
                        onAddPost={handleAddPost}
                        onUpdatePost={handleUpdatePost}
                        onDeletePost={handleDeletePost}
                        userId={userId}
                        authorName={authorName}
                        currentBoard={currentBoard}
                        setCurrentBoard={setCurrentBoard}
                        postToEdit={postToEdit}
                        setPostToEdit={setPostToEdit}
                    />
                );
            case 'market':
                if (!isLoggedIn) return <AuthWall />;
                return (
                    <MarketPage
                        products={products}
                        comments={comments}
                        onAddProduct={handleAddProduct}
                        onUpdateProduct={handleUpdateProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onAddComment={handleAddComment}
                        userId={userId}
                        authorName={authorName}
                    />
                );
            default:
                return <MapPage />;
        }
    };

    // Auth Wall Component (to replace simple alert in a real app)
    const AuthWall = () => (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-sm w-full border-t-8 border-red-500">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">🔐 로그인 필요</h3>
                <p className="text-gray-600 mb-6">
                    커뮤니티와 중고거래 장터는 로그인 후에 이용 가능한 서비스입니다.
                </p>
                <button
                    onClick={() => setCurrentPage('map')}
                    className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150"
                >
                    지도 페이지로 돌아가기
                </button>
            </div>
        </div>
    );

    // Header Component
    const Header = () => (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <h1 
                    className="text-2xl font-extrabold text-blue-700 cursor-pointer flex items-center"
                    onClick={() => navigate('map')}
                >
                    {/* 인하공업전문대학교 로고 이미지 Placeholder (파란색 배경에 I&T 텍스트) */}
                    <img 
                        src="https://placehold.co/32x32/003C9E/ffffff?text=I%26T" 
                        alt="인하공업전문대학교 로고" 
                        className="inline w-8 h-8 mr-2 rounded-full"
                    />
                    인하공전 캠퍼스 플랫폼
                </h1>
                
                <nav className="flex items-center space-x-2 md:space-x-4">
                    {/* Navigation Links */}
                    <NavButton pageKey="map" label="지도" icon={MapIcon} currentPage={currentPage} navigate={navigate} />
                    <NavButton pageKey="community" label="커뮤니티" icon={CommunityIcon} currentPage={currentPage} navigate={navigate} />
                    <NavButton pageKey="market" label="중고거래" icon={MarketIcon} currentPage={currentPage} navigate={navigate} />

                    {/* Auth Status */}
                    {isLoggedIn ? (
                        <div className="flex items-center space-x-3 bg-gray-100 p-2 rounded-full border border-gray-200">
                            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                                👋 {authorName}님 ({userId.substring(0, 4)}...)
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full hover:bg-red-600 transition duration-150 shadow-md"
                            >
                                로그아웃
                            </button>
                        </div>
                    ) : (
                        <div className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full shadow-md">
                            로그인 필요
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );

    const NavButton = ({ pageKey, label, icon: Icon, currentPage, navigate }) => {
        const isActive = currentPage === pageKey;
        const colorClass = isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100';
        
        return (
            <button
                onClick={() => navigate(pageKey)}
                className={`p-2 rounded-lg font-semibold transition duration-150 flex items-center ${colorClass}`}
            >
                <Icon className="w-5 h-5 mr-1 hidden sm:inline-block"/>
                {label}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                    body {
                        font-family: 'Inter', sans-serif;
                    }
                    /* Custom scrollbar for chat/comment window */
                    .overflow-y-auto::-webkit-scrollbar {
                        width: 8px;
                    }
                    .overflow-y-auto::-webkit-scrollbar-thumb {
                        background-color: #A3BFEE; /* Light blue thumb */
                        border-radius: 4px;
                    }
                    .overflow-y-auto::-webkit-scrollbar-track {
                        background: #f7f7f7; /* Light gray track */
                    }
                `}
            </style>
            <Header />
            <main className="pb-10">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;
