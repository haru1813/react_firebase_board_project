import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, limit, startAfter, doc, getDoc } from 'firebase/firestore';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Post } from '../types';
import Button from '../components/Button';
import Header from '../components/Header';
import './BoardPage.css';

const BoardListPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async (isLoadMore = false) => {
    try {
      setLoading(true);
      let q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      if (isLoadMore && lastDoc) {
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(10)
        );
      }

      const querySnapshot = await getDocs(q);
      const postsData: Post[] = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        let authorName = '알 수 없음';
        
        // 작성자 정보 가져오기
        if (data.authorId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', data.authorId));
            if (userDoc.exists()) {
              authorName = userDoc.data().displayName || '알 수 없음';
            }
          } catch (e) {
            console.error('작성자 정보 조회 실패:', e);
          }
        }

        postsData.push({
          id: docSnap.id,
          title: data.title,
          content: data.content,
          authorId: data.authorId,
          authorName: authorName,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          viewCount: data.viewCount || 0
        });
      }

      if (isLoadMore) {
        setPosts(prev => [...prev, ...postsData]);
      } else {
        setPosts(postsData);
      }

      if (querySnapshot.docs.length < 10) {
        setHasMore(false);
      } else {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <>
      <Header />
      <div className="board-container">
        <div className="page-header">
          <h1>게시판</h1>
          <Button variant="primary" onClick={() => navigate('/board/write')}>
            ✏️ 글쓰기
          </Button>
        </div>

        {loading && posts.length === 0 ? (
          <div className="loading">로딩 중...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">게시글이 없습니다.</div>
        ) : (
          <>
            <table className="board-table">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>번호</th>
                  <th style={{ width: '50%' }}>제목</th>
                  <th style={{ width: '15%' }}>작성자</th>
                  <th style={{ width: '15%' }}>작성일</th>
                  <th style={{ width: '10%' }}>조회수</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr key={post.id} onClick={() => navigate(`/board/${post.id}`)} style={{ cursor: 'pointer' }}>
                    <td>{posts.length - index}</td>
                    <td className="post-title">{post.title}</td>
                    <td>{post.authorName}</td>
                    <td>{formatDate(post.createdAt)}</td>
                    <td>{post.viewCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button variant="secondary" onClick={() => fetchPosts(true)}>
                  더 보기
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default BoardListPage;

