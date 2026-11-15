export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// json-server v1 페이지네이션 응답
export interface TodoPage {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: Todo[];
}
