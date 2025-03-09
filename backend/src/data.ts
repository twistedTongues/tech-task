export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  parentId: string | null;
  votes: number;
  replies?: Comment[];
}

// Initial seed data for development
export let comments: Comment[] = [
  {
    id: '1',
    text: 'This is the first comment',
    author: 'User1',
    timestamp: new Date().toISOString(),
    parentId: null,
    votes: 5
  },
  {
    id: '2',
    text: 'This is a reply to the first comment',
    author: 'User2',
    timestamp: new Date().toISOString(),
    parentId: '1',
    votes: 3
  }
];

