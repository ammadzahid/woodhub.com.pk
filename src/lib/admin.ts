import { cookies } from 'next/headers';
import { ADMIN_COOKIE, openAdmin } from './admin-token';

export * from './admin-token';

/** Server components aur API routes dono me — logged-in admin ya null. */
export async function currentAdmin() {
  const jar = await cookies();
  return openAdmin(jar.get(ADMIN_COOKIE)?.value);
}
