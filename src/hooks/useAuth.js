import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function carregarUsuario(session) {
      try {
        if (!session?.user) {
          if (mounted) {
            setUser(null);
            setRole(null);
          }
          return;
        }

        if (mounted) {
          setUser(session.user);
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar perfil:", error);

          if (mounted) {
            setRole("funcionario");
          }

          return;
        }

        if (mounted) {
          setRole(data?.role || "funcionario");
        }

      } catch (error) {
        console.error("Erro na autenticação:", error);

        if (mounted) {
          setRole("funcionario");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function iniciar() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      await carregarUsuario(session);
    }

    iniciar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        carregarUsuario(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    role,
    loading,
  };
}