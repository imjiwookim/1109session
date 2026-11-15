import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTodo } from "../api/todo";
import type { Todo, TodoPage } from "../types/todo";

interface TodoListProps {
  todos: Todo[];
}

export default function TodoList({ todos }: TodoListProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: updateTodo,

    onMutate: async (updatedTodo) => {
      // 1. 조회 결과가 낙관적 변경을 덮어쓰지 않도록 취소
      await queryClient.cancelQueries({
        queryKey: ["todos"],
      });

      // 2. 실패 시 복구할 모든 페이지 캐시 백업
      const prevPages = queryClient.getQueriesData<TodoPage>({
        queryKey: ["todos"],
      });

      // 3. 서버 응답 전에 캐시된 모든 페이지에서 완료 상태 변경
      queryClient.setQueriesData<TodoPage>(
        { queryKey: ["todos"] },
        (currentPage) =>
          currentPage && {
            ...currentPage,
            data: currentPage.data.map((todo) =>
              todo.id === updatedTodo.id
                ? { ...todo, completed: updatedTodo.completed }
                : todo,
            ),
          },
      );

      // 4. onError에서 사용할 백업 반환
      return { prevPages };
    },

    onError: (_error, _variables, rollbackData) => {
      // 실패하면 페이지별로 기존 캐시 복구
      rollbackData?.prevPages.forEach(([queryKey, page]) => {
        queryClient.setQueryData(queryKey, page);
      });
    },

    onSettled: () => {
      // 성공·실패 모두 서버 데이터와 다시 맞추기
      return queryClient.invalidateQueries({
        queryKey: ["todos"],
      });
    },
  });

  if (todos.length === 0) {
    return <p className="empty-message">아직 등록된 할 일이 없어요.</p>;
  }

  return (
    <>
      {isError && <p role="alert">{error.message}</p>}

      <ul className="todo-list">
        {todos.map((todo) => (
          <li className="todo-item" key={todo.id}>
            <label className="todo-label">
              <input
                type="checkbox"
                checked={todo.completed}
                disabled={isPending}
                onChange={() => {
                  mutate({
                    id: todo.id,
                    completed: !todo.completed,
                  });
                }}
              />

              <span className={todo.completed ? "completed" : ""}>
                {todo.title}
              </span>
            </label>

            <button
              className="delete-button"
              type="button"
              aria-label={`${todo.title} 삭제`}
              disabled
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}