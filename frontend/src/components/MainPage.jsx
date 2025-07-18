import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import './MainPage.css';

const MainPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [popularPosts, setPopularPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [recommendationInfo, setRecommendationInfo] = useState(null);
  const [error, setError] = useState(null);

  // 카테고리 영어 -> 한글 매핑 함수
  const getCategoryInKorean = (category) => {
    const categoryMap = {
      INFO: '정보',
      FREE: '자유',
      QNA: 'Q&A',
      WALKWITH: '산책모임',
    };
    return categoryMap[category] || category;
  };

  // 카테고리 영어 -> 라우팅 경로 매핑 함수
  const getCategoryRoute = (category) => {
    const routeMap = {
      INFO: 'info',
      FREE: 'free',
      QNA: 'qna',
      WALKWITH: 'walkwith',
    };
    return routeMap[category] || 'free';
  };

  // 게시물 클릭 핸들러
  const handlePostClick = (post) => {
    const category = getCategoryRoute(post.boardKind || post.category);
    navigate(`/board/${category}/${post.id}`);
  };

  // 더미 데이터
  const bannerData = {
    title: '🐾 반려동물과 함께하는 행복한 일상',
    subtitle: 'Petory에서 더 나은 반려생활을 시작하세요',
    image: '/images/pet-default.png',
  };

  // 로그인하지 않은 유저를 위한 추천 게시물 (카테고리별 베스트 + 계절별 콘텐츠)
  const getRecommendedPostsForGuest = () => {
    const currentMonth = new Date().getMonth() + 1;
    const isSpring = currentMonth >= 3 && currentMonth <= 5;
    const isSummer = currentMonth >= 6 && currentMonth <= 8;
    const isAutumn = currentMonth >= 9 && currentMonth <= 11;
    const isWinter = currentMonth === 12 || currentMonth <= 2;

    return [
      {
        id: 101,
        title: '반려동물 입양 전 꼭 알아야 할 10가지',
        author: 'Petory팀',
        views: 2156,
        likes: 89,
        category: 'INFO',
        isSeasonal: false,
        description: '입양 전 체크리스트와 준비사항',
      },
      {
        id: 102,
        title: '초보 집사를 위한 반려동물 기본 관리법',
        author: '수의사김선생',
        views: 1892,
        likes: 67,
        category: 'INFO',
        isSeasonal: false,
        description: '기본적인 케어 방법과 주의사항',
      },
      {
        id: 103,
        title: isSpring
          ? '봄철 반려동물 알레르기 대처법'
          : isSummer
          ? '여름철 반려동물 더위 대비법'
          : isAutumn
          ? '가을철 반려동물 건강관리'
          : '겨울철 반려동물 보온 관리법',
        author: '건강관리전문가',
        views: 1456,
        likes: 52,
        category: 'INFO',
        isSeasonal: true,
        description: isSpring
          ? '봄철 알레르기 예방과 관리'
          : isSummer
          ? '더위 대비와 안전한 여름 보내기'
          : isAutumn
          ? '가을철 건강관리 포인트'
          : '겨울철 보온과 건강관리',
      },
      {
        id: 104,
        title: '우리 강아지/고양이 사진 자랑해요',
        author: '반려동물맘',
        views: 892,
        likes: 45,
        category: 'FREE',
        isSeasonal: false,
        description: '귀여운 반려동물 사진 공유',
      },
      {
        id: 105,
        title: '반려동물 응급상황 대처법',
        author: '응급수의사',
        views: 1234,
        likes: 78,
        category: 'QNA',
        isSeasonal: false,
        description: '응급상황 시 침착하게 대응하는 방법',
      },
    ];
  };

  const infoPosts = [
    {
      id: 9,
      title: '224등록제 변경사항',
      content: '올해부터 반려동물 등록이 의무화되었습니다...',
    },
    {
      id: 10,
      title: '계절별 반려동물 관리법',
      content: '봄철 알레르기부터 겨울철 보온까지...',
    },
    {
      id: 11,
      title: '반려동물 응급상황 대처법',
      content: '갑작스러운 상황에서 침착하게 대응하는 방법...',
    },
  ];

  // 인기 게시글 API 호출
  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get('/main/popular?limit=5');
        setPopularPosts(response.data);

        console.log('인기 게시글 조회 성공:', response.data);
      } catch (err) {
        console.error('인기 게시글 조회 실패:', err);
        setError('인기 게시글을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  // 추천 게시글 API 호출 (모든 사용자)
  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      try {
        const response = await axios.get('/main/recommended?limit=5');
        setRecommendedPosts(response.data.posts);
        setRecommendationInfo({
          type: response.data.recommendationType,
          hashtags: response.data.selectedHashtags,
          message: response.data.message,
        });

        console.log('추천 게시글 조회 성공:', response.data);
      } catch (err) {
        console.error('추천 게시글 조회 실패:', err);
        // 추천 실패 시 기존 더미 데이터 사용
        setRecommendedPosts([]);
      }
    };

    fetchRecommendedPosts();
  }, []);

  // 추천 타입에 따른 제목과 설명 생성
  const getRecommendationTitle = () => {
    if (!recommendationInfo) return '💡 추천 게시물';

    switch (recommendationInfo.type) {
      case 'personalized':
        return '💡 맞춤 추천 게시물';
      case 'popular_hashtags':
        return '🔥 인기 해시태그 게시물 추천';
      case 'fallback':
        return '🔥 인기 게시글 추천';
      default:
        return '💡 추천 게시물';
    }
  };

  const getRecommendationDescription = () => {
    if (!recommendationInfo) return null;

    // 인기 해시태그 기반 추천인 경우 특별한 스타일 적용 (로그인 여부 관계없이)
    if (
      recommendationInfo.type === 'popular_hashtags' &&
      recommendationInfo.hashtags &&
      recommendationInfo.hashtags.length > 0
    ) {
      return (
        <div className="recommendation-info popular-hashtags-info">
          <p className="recommendation-message">
            💡 <strong>최근 인기 해시태그</strong>가 달린 게시물을 추천해드려요!
          </p>
          <div className="popular-hashtags-display">
            <span className="popular-hashtags-label">🔥 인기 해시태그:</span>
            <div className="popular-hashtags-list">
              {recommendationInfo.hashtags.map((tag, index) => (
                <span key={index} className="popular-hashtag-tag">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          {/* 비로그인 사용자에게 로그인 유도 메시지 추가 */}
          {!isLoggedIn && (
            <div className="login-encouragement-mini">
              <p>
                더 정확한 맞춤 추천을 받으려면{' '}
                <button
                  className="login-link-btn-mini"
                  onClick={() => navigate('/members/login')}
                >
                  로그인
                </button>
                하세요!
              </p>
            </div>
          )}
        </div>
      );
    }

    // 비로그인 사용자이고 인기 해시태그 추천이 아닌 경우
    if (!isLoggedIn) {
      return (
        <p className="login-encouragement">
          더 많은 맞춤 추천을 받으려면{' '}
          <button
            className="login-link-btn"
            onClick={() => navigate('/members/login')}
          >
            로그인
          </button>
          하세요!
        </p>
      );
    }

    return (
      <div className="recommendation-info">
        <p className="recommendation-message">{recommendationInfo.message}</p>
        {recommendationInfo.hashtags &&
          recommendationInfo.hashtags.length > 0 && (
            <div className="selected-hashtags">
              <span>선택된 해시태그: </span>
              {recommendationInfo.hashtags.map((tag, index) => (
                <span key={index} className="hashtag-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
      </div>
    );
  };

  // 현재 표시할 추천 게시물 결정
  const getCurrentRecommendedPosts = () => {
    if (recommendedPosts.length > 0) {
      return recommendedPosts;
    }

    // 추천 데이터가 없으면 더미 데이터 사용
    return getRecommendedPostsForGuest();
  };

  // 스켈레톤 컴포넌트들
  const BannerSkeleton = () => (
    <section className="banner-section">
      <div className="banner-content">
        <div className="banner-text">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-subtitle"></div>
          <div className="skeleton skeleton-button"></div>
        </div>
        <div className="banner-image">
          <div className="skeleton skeleton-image"></div>
        </div>
      </div>
    </section>
  );

  const PostSkeleton = () => (
    <div className="post-item skeleton-post">
      <div className="skeleton skeleton-category"></div>
      <div className="skeleton skeleton-post-title"></div>
      <div className="skeleton skeleton-post-meta"></div>
    </div>
  );

  const InfoPostSkeleton = () => (
    <div className="info-post-item skeleton-info-post">
      <div className="skeleton skeleton-info-title"></div>
      <div className="skeleton skeleton-info-content"></div>
      <div className="skeleton skeleton-info-content"></div>
      <div className="skeleton skeleton-button"></div>
    </div>
  );

  return (
    <>
      <Header />
      <main className="main-container">
        {/* 배너 섹션 */}
        <section className="banner-section">
          <div className="banner-content">
            <div className="banner-text">
              <h1>{bannerData.title}</h1>
              <p>{bannerData.subtitle}</p>
              <button
                className="banner-btn"
                onClick={() => navigate('/members/login')}
              >
                시작하기
              </button>
            </div>
            <div className="banner-image">
              <img src={bannerData.image} alt="반려동물" />
            </div>
          </div>
        </section>

        {/* 인기글 & 추천 게시물 섹션 */}
        <section className="posts-section">
          <div className="popular-posts">
            <h2>🔥 인기글</h2>
            <div className="posts-list">
              {isLoading ? (
                // 로딩 중일 때 스켈레톤 UI
                [...Array(4)].map((_, index) => <PostSkeleton key={index} />)
              ) : error ? (
                // 에러 메시지 표시
                <div className="error-message">
                  <p>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="retry-button"
                  >
                    다시 시도
                  </button>
                </div>
              ) : (
                // 실제 데이터 표시
                popularPosts.map((post) => (
                  <div
                    key={post.id}
                    className="post-item"
                    onClick={() => handlePostClick(post)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="post-category">
                      {getCategoryInKorean(post.category)}
                    </div>
                    <h3 className="post-title">{post.title}</h3>
                    {/* 해시태그 표시 */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="post-hashtags">
                        {post.hashtags.slice(0, 3).map((hashtag, index) => (
                          <span key={index} className="post-hashtag">
                            #{hashtag.tagName || hashtag}
                          </span>
                        ))}
                        {post.hashtags.length > 3 && (
                          <span className="post-hashtag-more">
                            +{post.hashtags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="post-meta">
                      <span className="post-author">{post.author}</span>
                      <span className="post-views">
                        조회수 : {post.viewCount}
                      </span>
                      <span className="post-likes">
                        추천수 : {post.likeCount}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="recommended-posts">
            <h2>{getRecommendationTitle()}</h2>
            {getRecommendationDescription()}
            <div className="posts-list">
              {recommendedPosts.length === 0
                ? // 추천 로딩 중
                  [...Array(4)].map((_, index) => <PostSkeleton key={index} />)
                : // 실제 데이터 표시
                  getCurrentRecommendedPosts().map((post) => (
                    <div
                      key={post.id}
                      className="post-item"
                      onClick={() => handlePostClick(post)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="post-category">
                        {getCategoryInKorean(post.boardKind || post.category)}
                        {post.isSeasonal && (
                          <span className="seasonal-badge">계절</span>
                        )}
                      </div>
                      <h3 className="post-title">{post.title}</h3>
                      {post.description && (
                        <p className="post-description">{post.description}</p>
                      )}
                      <div className="post-meta">
                        <span className="post-author">
                          {post.memberNickname || post.author}
                        </span>
                        <span className="post-views">
                          조회수 : {post.viewCount || post.views}
                        </span>
                        <span className="post-likes">
                          추천수 : {post.likeCount || post.likes || 0}
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* 정보글 섹션 */}
        <section className="info-posts-section">
          <h2>📰 정보글</h2>
          <div className="info-posts-grid">
            {infoPosts.map((post) => (
              <div key={post.id} className="info-post-item">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <button className="read-more-btn">자세히 보기</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default MainPage;
