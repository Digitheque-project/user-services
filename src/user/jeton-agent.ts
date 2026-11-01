/** Contenu utile du JWT de l'agent (posé dans req.user par la stratégie JWT). */
export interface JetonAgent {
  userId?: string;
  services?: Array<{ roleName?: string | null; serviceName?: string | null }>;
}

/** Administrateur : un rôle « Admin » (ou un service d'administration) dans son jeton. */
export function estAdministrateur(agent: JetonAgent): boolean {
  return (agent.services ?? []).some(
    (s) => /admin/i.test(s.roleName ?? '') || /^admin\b/i.test(s.serviceName ?? ''),
  );
}
