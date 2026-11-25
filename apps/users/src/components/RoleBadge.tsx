import type { Role } from '@mfe/contracts';
import { Badge } from '@mfe/ui';

const tone = { admin: 'brand', moderator: 'amber', user: 'neutral' } as const;

export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={tone[role] ?? 'neutral'}>{role}</Badge>;
}
