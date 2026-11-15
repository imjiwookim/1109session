# TanStack Query 과제: 페이지네이션 + 프리페칭

세션에서 만든 Todo 앱에 TanStack Query의 **페이지네이션(`keepPreviousData`)** 과 **프리페칭(`prefetchQuery`)** 을 추가했습니다.

## 1. 선택한 TanStack Query 기능

### 페이지네이션 (Pagination)
Todo 목록을 한 번에 모두 가져오지 않고 페이지 단위(3개씩)로 나누어 조회합니다.
쿼리 키에 페이지 번호를 포함(`["todos", { page }]`)하면 페이지마다 캐시가 따로 저장됩니다.

`placeholderData: keepPreviousData`를 설정하면 새 페이지를 불러오는 동안 이전 페이지 데이터를 그대로 보여줍니다. 그래서 페이지를 넘길 때 "로딩 중..." 화면이 깜빡이지 않습니다. 이때 `isPlaceholderData`가 `true`가 됩니다.

### 프리페칭 (Prefetching)
사용자가 다음 페이지 버튼을 누르기 전에 `queryClient.prefetchQuery`로 다음 페이지를 미리 가져와 캐시에 저장합니다. 버튼을 누르면 캐시에 데이터가 이미 있어서 바로 표시됩니다.

## 2. 구현한 코드 설명

| 파일 | 변경 내용 |
|---|---|
| `src/types/todo.ts` | json-server 페이지 응답 형태인 `TodoPage`(`next`, `pages`, `items`, `data` 등) 타입 추가 |
| `src/api/todo.ts` | `fetchTodosPage(page)` 추가. `GET /todos?_page=1&_per_page=3` 호출 |
| `src/hooks/useTodosData.ts` | `useTodosData(page)`로 변경. 쿼리 키에 페이지 포함, `keepPreviousData` 적용, `useEffect`에서 `next` 페이지를 `prefetchQuery` |
| `src/App.tsx` | `page` 상태, 이전/다음 버튼, "총 N개 · 현재/전체 페이지" 표시 |
| `src/components/TodoForm.tsx` | 추가 성공 시 `invalidateQueries({ queryKey: ["todos"] })`로 모든 페이지 캐시 무효화 (페이지 구성이 바뀌기 때문) |
| `src/components/TodoList.tsx` | 낙관적 업데이트를 페이지 구조에 맞게 수정. `getQueriesData`로 모든 페이지를 백업하고 `setQueriesData`로 변경하며, 실패하면 페이지별로 복구 |
| `server/db.json` | 페이지가 여러 개 나오도록 Todo를 7개로 늘림 |
| `package.json` | API 서버 실행용 `server` 스크립트 추가 |

핵심 코드 (`src/hooks/useTodosData.ts`):

```ts
const query = useQuery({
  queryKey: ["todos", { page }],
  queryFn: () => fetchTodosPage(page),
  staleTime: 5000,
  placeholderData: keepPreviousData,
});

const nextPage = query.data?.next;

useEffect(() => {
  if (nextPage) {
    void queryClient.prefetchQuery({
      queryKey: ["todos", { page: nextPage }],
      queryFn: () => fetchTodosPage(nextPage),
      staleTime: 5000,
    });
  }
}, [nextPage, queryClient]);
```

"다음" 버튼은 `isPlaceholderData`가 `true`이거나 다음 페이지가 없으면(`data.next === null`) 비활성화됩니다.

## 3. 실행 방법

```bash
npm install
npm run server   # API 서버 (http://localhost:3000)
npm run dev      # 프론트엔드 (새 터미널에서)
```

React Query Devtools(화면 하단 아이콘)에서 `["todos", { page: 2 }]` 같은 쿼리가 페이지마다 따로 생기고, 1페이지를 볼 때 2페이지 쿼리가 미리 만들어지는 것을 확인할 수 있습니다.

## 4. 동작 화면

> 아래 이미지는 직접 캡처해서 `screenshots/` 폴더에 넣고 경로를 맞춰 주세요.

| 1페이지 | 2페이지로 이동 | Devtools (프리페치된 쿼리) |
|---|---|---|
| ![1페이지](./screenshots/page1.png) | ![2페이지](./screenshots/page2.png) | ![Devtools](./screenshots/devtools.png) |
