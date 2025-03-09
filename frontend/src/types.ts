export interface CommentType {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  parentId: string | null;
  votes: number;
  replies?: CommentType[];
}

export interface PaginatedResponse {
  comments: CommentType[];
  currentPage: number;
  totalPages: number;
  totalComments: number;
}

