import { useQuery } from "@tanstack/react-query";

interface AdminStatusResponse {
  isAdmin: boolean;
  email?: string | null;
  userId?: string;
}

export function useAdminStatus(enabled: boolean) {
  return useQuery<AdminStatusResponse>({
    queryKey: ["admin", "status"],
    queryFn: async () => {
      const response = await fetch("/api/admin/verify", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        // Usuário autenticado mas sem privilégios de admin
        return { isAdmin: false };
      }

      if (!response.ok) {
        throw new Error("Falha ao verificar privilégios de administrador");
      }

      return response.json();
    },
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}
