const CHAVE = 'pokeweb-user-id';

// Convidado: UUID por dispositivo em localStorage. Com OAuth, esta função
// passa a devolver o id real sem mudar os call sites.
export function getUserId(): string {
  if (typeof window === 'undefined') return 'ssr-anon'; // guard SSR
  let id = window.localStorage.getItem(CHAVE);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(CHAVE, id);
  }
  return id;
}
