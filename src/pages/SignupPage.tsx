import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import './AuthPage.css';

const SignupPage = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검증
    if (!displayName || !email || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await signup(email, password, displayName);
      navigate('/');
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      let errorMessage = '회원가입에 실패했습니다.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = '이미 사용 중인 이메일입니다.';
          break;
        case 'auth/invalid-email':
          errorMessage = '올바른 이메일 형식을 입력해주세요.';
          break;
        case 'auth/weak-password':
          errorMessage = '비밀번호는 6자 이상이어야 합니다.';
          break;
        default:
          errorMessage = error.message || '회원가입에 실패했습니다.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>회원가입</h2>
        {error && <Alert type="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            label="이름"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="홍길동"
            required
          />
          <Input
            type="email"
            label="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />
          <Input
            type="password"
            label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요 (최소 6자)"
            required
          />
          <Input
            type="password"
            label="비밀번호 재확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
          <Button type="submit" variant="success" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? '회원가입 중...' : '회원가입'}
          </Button>
        </form>
        <div className="auth-link">
          <span>이미 계정이 있으신가요? </span>
          <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

