import { useState } from "react";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import { useTodosData } from "./hooks/useTodosData";

export default function App() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isPlaceholderData } = useTodosData(page);

  return (
    <main className="todo-card">
      <header className="todo-header">
        <p className="eyebrow">MY DAILY PLAN</p>
        <h1>오늘의 할 일</h1>
      </header>

      <TodoForm />

      <div className="list-heading">
        <h2>할 일 목록</h2>
        {data && (
          <span>
            총 {data.items}개 · {page} / {data.pages} 페이지
          </span>
        )}
      </div>

      {isPending ? (
        <p>로딩 중...</p>
      ) : isError ? (
        <p>할 일 목록을 불러오지 못했습니다.</p>
      ) : (
        <>
          <TodoList todos={data.data} />

          <nav className="pagination" aria-label="페이지 이동">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={page === 1}
            >
              이전
            </button>

            <span>{page}</span>

            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={isPlaceholderData || data.next === null}
            >
              다음
            </button>
          </nav>
        </>
      )}
    </main>
  );
}
