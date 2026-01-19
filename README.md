# React Firebase 게시판 프로젝트

React와 Firebase를 연동한 로그인/회원가입 인증 기능과 게시판 CRUD 기능을 제공하는 웹 애플리케이션입니다.

## 주요 기능

- ✅ 사용자 인증 (회원가입, 로그인, 로그아웃)
- ✅ 게시글 작성 (Create)
- ✅ 게시글 목록 조회 (Read)
- ✅ 게시글 상세 조회 (Read)
- ✅ 게시글 수정 (Update)
- ✅ 게시글 삭제 (Delete)
- ✅ 조회수 관리
- ✅ 작성자 권한 관리

## 기술 스택

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Firebase (Authentication, Firestore)
- **Routing**: React Router DOM
- **Styling**: CSS

## 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Header.tsx       # 헤더 컴포넌트
│   ├── Button.tsx       # 버튼 컴포넌트
│   ├── Input.tsx        # 입력 필드 컴포넌트
│   ├── Alert.tsx        # 알림 컴포넌트
│   └── ProtectedRoute.tsx # 보호된 라우트 컴포넌트
├── contexts/            # Context API
│   └── AuthContext.tsx  # 인증 컨텍스트
├── firebase/            # Firebase 설정
│   └── config.ts        # Firebase 초기화
├── pages/               # 페이지 컴포넌트
│   ├── LoginPage.tsx    # 로그인 페이지
│   ├── SignupPage.tsx   # 회원가입 페이지
│   ├── BoardListPage.tsx    # 게시글 목록 페이지
│   ├── BoardWritePage.tsx   # 게시글 작성 페이지
│   ├── BoardDetailPage.tsx  # 게시글 상세 페이지
│   └── BoardEditPage.tsx    # 게시글 수정 페이지
├── types/               # TypeScript 타입 정의
│   └── index.ts
├── App.tsx              # 메인 앱 컴포넌트
└── main.tsx             # 진입점

document/                # 프로젝트 문서
├── 비지니스 로직 정의서.html
├── 요구사항 명세서.html
├── 와이어프레임.html
├── 유스케이스 다이어그램.html
└── 프로토타입.html
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Firebase 설정

Firebase 콘솔에서 다음을 설정해야 합니다:

1. **Authentication** 활성화
   - 이메일/비밀번호 인증 방식 활성화

2. **Firestore Database** 생성
   - 테스트 모드 또는 프로덕션 모드로 생성

3. **Firestore 보안 규칙** 설정
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // 사용자는 자신의 정보만 수정 가능
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // 게시글은 인증된 사용자만 읽기 가능, 작성자만 수정/삭제 가능
       match /posts/{postId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null 
                       && request.resource.data.authorId == request.auth.uid;
         allow update, delete: if request.auth != null 
                             && resource.data.authorId == request.auth.uid;
       }
     }
   }
   ```

4. **Firestore 인덱스** 생성 (필요시)
   - `posts` 컬렉션의 `createdAt` 필드에 대한 인덱스

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 4. 빌드

```bash
npm run build
```

## 사용 방법

### 회원가입
1. `/signup` 페이지에서 이메일, 비밀번호, 이름 입력
2. 회원가입 버튼 클릭
3. 자동으로 로그인되어 게시판 목록으로 이동

### 로그인
1. `/login` 페이지에서 이메일, 비밀번호 입력
2. 로그인 버튼 클릭
3. 게시판 목록으로 이동

### 게시글 작성
1. 게시판 목록에서 "글쓰기" 버튼 클릭
2. 제목과 내용 입력
3. "등록" 버튼 클릭

### 게시글 조회
1. 게시판 목록에서 게시글 클릭
2. 상세 페이지에서 내용 확인
3. 조회수 자동 증가

### 게시글 수정
1. 본인이 작성한 게시글 상세 페이지에서 "수정" 버튼 클릭
2. 제목과 내용 수정
3. "수정" 버튼 클릭

### 게시글 삭제
1. 본인이 작성한 게시글 상세 페이지에서 "삭제" 버튼 클릭
2. 확인 다이얼로그에서 확인
3. 게시글과 관련 댓글이 함께 삭제됨

## Firestore 데이터 구조

### users 컬렉션
```
users/{userId}
  - email: string
  - displayName: string
  - createdAt: timestamp
  - updatedAt: timestamp
```

### posts 컬렉션
```
posts/{postId}
  - title: string
  - content: string
  - authorId: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - viewCount: number
```

## 주요 기능 설명

### 인증 시스템
- Firebase Authentication을 사용한 이메일/비밀번호 인증
- Context API를 통한 전역 인증 상태 관리
- 보호된 라우트를 통한 인증 필요 페이지 접근 제어

### 게시판 시스템
- Firestore를 사용한 실시간 데이터베이스
- 페이지네이션 지원 (더 보기 방식)
- 작성자 권한 기반 수정/삭제 제어
- 조회수 자동 증가

## 참고 문서

프로젝트의 상세한 설계 문서는 `document` 폴더를 참고하세요:
- 비지니스 로직 정의서
- 요구사항 명세서
- 와이어프레임
- 유스케이스 다이어그램
- 프로토타입

## 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.
