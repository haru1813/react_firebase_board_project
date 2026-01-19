import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Input, Textarea } from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Header from '../components/Header';
import './BoardPage.css';

const BoardEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

      // 권한 확인
      if (currentUser?.uid !== data.authorId) {
        setError('수정 권한이 없습니다.');
        return;
      }

      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError('');

    // 유효성 검증
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    if (title.length > 200) {
      setError('제목은 200자 이하여야 합니다.');
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(db, 'posts', id), {
        title: title.trim(),
        content: content.trim(),
        updatedAt: serverTimestamp()
      });
      navigate(`/board/${id}`);
    } catch (error: any) {
      console.error('게시글 수정 실패:', error);
      setError('게시글 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <>
      <Header />
      <div className="board-container">
        <h2>글수정</h2>
        {error && <Alert type="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="게시글 제목을 입력하세요"
            maxLength={200}
            required
          />
          <Textarea
            label="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="게시글 내용을 입력하세요"
            required
          />
          <div style={{ textAlign: 'right', marginTop: '25px' }}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={saving} style={{ marginLeft: '10px' }}>
              {saving ? '수정 중...' : '수정'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default BoardEditPage;

