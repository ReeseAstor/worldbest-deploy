'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBooks,
  createBook,
  updateBook,
  type BookCreate,
  type BookUpdate,
} from '@/lib/api/books';

export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (projectId: string) => [...bookKeys.lists(), projectId] as const,
};

export function useBooks(projectId: string | null) {
  return useQuery({
    queryKey: bookKeys.list(projectId!),
    queryFn: () => getBooks(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: BookCreate }) =>
      createBook(projectId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.list(variables.projectId) });
    },
  });
}

export function useUpdateBook(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: BookUpdate }) =>
      updateBook(bookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.list(projectId) });
    },
  });
}
