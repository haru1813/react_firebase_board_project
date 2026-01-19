import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Input, Textarea } from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Header from '../components/Header';
import './BoardPage.css';

const BoardWritePage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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

    if (!currentUser) {
      setError('로그인이 필요합니다.');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        content: content.trim(),
        authorId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        viewCount: 0
      });
      navigate('/');
    } catch (error: any) {
      console.error('게시글 작성 실패:', error);
      setError('게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="board-container">
        <h2>글쓰기</h2>
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
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={loading} style={{ marginLeft: '10px' }}>
              {loading ? '등록 중...' : '등록'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default BoardWritePage;

