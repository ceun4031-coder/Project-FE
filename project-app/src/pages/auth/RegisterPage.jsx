import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 간단한 비밀번호 확인 로직
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    console.log('회원가입 요청:', formData);
    // TODO: API 호출 로직 작성
    navigate('/auth/login');
  };

  return (
      <main className='page-container'>
      <h1>회원가입</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">이메일</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label htmlFor="password">비밀번호</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <input 
            type="password" 
            id="passwordConfirm" 
            name="passwordConfirm" 
            value={formData.passwordConfirm} 
            onChange={handleChange} 
            required 
          />
        </div>

        <button type="submit">가입하기</button>
      </form>

      <div>
        <Link to="/auth/login">이미 계정이 있으신가요?</Link>
      </div>
    </main>
  );
};

export default RegisterPage;