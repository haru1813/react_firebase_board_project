import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types';
import Button from '../components/Button';
import Header from '../components/Header';
import Alert from '../components/Alert';
import './BoardPage.css';

const BoardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const postDoc = await getDoc(doc(db, 'posts', id));

      if (!postDoc.exists()) {
        setError('게시글을 찾을 수 없습니다.');
        return;
      }

      const data = postDoc.data();
      
      // 작성자 정보 가져오기
      let authorName = '알 수 없음';
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

      const postData: Post = {
        id: postDoc.id,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorName: authorName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        viewCount: data.viewCount || 0
      };

      setPost(postData);

      // 조회수 증가
      await updateDoc(doc(db, 'posts', id), {
        viewCount: increment(1)
      });
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !post) return;

    if (!window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setDeleting(true);
      
      // 연관 댓글 삭제 (댓글이 있다면)
      const commentsQuery = query(collection(db, 'comments'), where('postId', '==', id));
      const commentsSnapshot = await getDocs(commentsQuery);
      const deletePromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // 게시글 삭제
      await deleteDoc(doc(db, 'posts', id));
      navigate('/');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      setError('게시글 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAuthor = currentUser && post && currentUser.uid === post.authorId;

  if (loading) {
    return (
      <>
        <Header />
        <div className="board-container">
          <div className="loading">로딩 중...</div>
        </div>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <div className="board-container">
          <Alert type="error">{error || '게시글을 찾을 수 없습니다.'}</Alert>
          <Button variant="secondary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
            목록으로
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="board-container">
        <div className="post-card">
          <div className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              작성자: {post.authorName} | 작성일: {formatDate(post.createdAt)} | 조회수: {post.viewCount + 1}
            </div>
            {post.updatedAt && 
             ((post.updatedAt.toMillis && post.createdAt.toMillis && post.updatedAt.toMillis() !== post.createdAt.toMillis()) ||
              (!post.updatedAt.toMillis && post.updatedAt !== post.createdAt)) && (
              <div className="post-meta" style={{ marginTop: '5px' }}>
                수정일: {formatDate(post.updatedAt)}
              </div>
            )}
          </div>
          <div className="post-content">
            {post.content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
          <div className="post-actions">
            <Button variant="secondary" onClick={() => navigate('/')}>
              목록
            </Button>
            {isAuthor && (
              <>
                <Button variant="warning" onClick={() => navigate(`/board/edit/${post.id}`)} style={{ marginLeft: '10px' }}>
                  수정
                </Button>
                <Button variant="danger" onClick={handleDelete} disabled={deleting} style={{ marginLeft: '10px' }}>
                  {deleting ? '삭제 중...' : '삭제'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardDetailPage;

