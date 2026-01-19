import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import './AuthPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검증
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      console.error('로그인 실패:', error);
      let errorMessage = '로그인에 실패했습니다.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = '등록되지 않은 이메일입니다.';
          break;
        case 'auth/wrong-password':
          errorMessage = '비밀번호가 일치하지 않습니다.';
          break;
        case 'auth/invalid-email':
          errorMessage = '올바른 이메일 형식을 입력해주세요.';
          break;
        case 'auth/user-disabled':
          errorMessage = '비활성화된 계정입니다.';
          break;
        default:
          errorMessage = error.message || '로그인에 실패했습니다.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>로그인</h2>
        {error && <Alert type="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
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
            placeholder="비밀번호를 입력하세요"
            required
          />
          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
        <div className="auth-link">
          <span>계정이 없으신가요? </span>
          <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

