import { useEffect } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchTodosPage } from "../api/todo";

export const useTodosData = (page: number) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["todos", { page }],
    queryFn: () => fetchTodosPage(page),
    staleTime: 5000,
    // 페이지를 넘길 때 이전 페이지 데이터를 유지해 로딩 깜빡임을 없앰
    placeholderData: keepPreviousData,
  });

  const nextPage = query.data?.next;

  // 다음 페이지가 있으면 미리 가져와 캐시에 저장 (프리페칭)
  useEffect(() => {
    if (nextPage) {
      void queryClient.prefetchQuery({
        queryKey: ["todos", { page: nextPage }],
        queryFn: () => fetchTodosPage(nextPage),
        staleTime: 5000,
      });
    }
  }, [nextPage, queryClient]);

  return query;
};
