// 타입 정의

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  updatedAt: any;
  viewCount: number;
}

export interface PostFormData {
  title: string;
  content: string;
}

