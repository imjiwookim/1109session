import type { Todo, TodoPage } from "../types/todo";

export const TODOS_PER_PAGE = 3;

// json-server v1의 _page, _per_page 쿼리로 페이지 단위 조회
export const fetchTodosPage = async (page: number): Promise<TodoPage> => {
  const response = await fetch(
    `http://localhost:3000/todos?_page=${page}&_per_page=${TODOS_PER_PAGE}`,
  );

  if (!response.ok) {
    throw new Error("할 일 목록을 불러오지 못했습니다.");
  }

  return response.json();
};

export const fetchTodos = async (): Promise<Todo[]> => {
  const response = await fetch("http://localhost:3000/todos");

  if (!response.ok) {
    throw new Error("할 일 목록을 불러오지 못했습니다.");
  }

  return response.json();
};

export const createTodo = async (title: string): Promise<Todo> => {
  const response = await fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      completed: false,
    }),
  });

  if (!response.ok) {
    throw new Error("할 일을 추가하지 못했습니다.");
  }

  return response.json();
};

export const updateTodo = async ({
  id,
  completed,
}: Pick<Todo, "id" | "completed">): Promise<Todo> => {
  // 화면 변화를 볼 수 있도록 5초 기다리기
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const response = await fetch(`http://localhost:3000/todos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed }),
  });

  if (!response.ok) {
    throw new Error("완료 상태를 변경하지 못했습니다.");
  }

  return response.json();
};