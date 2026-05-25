import { cookies } from "next/headers";

export async function getAuthHeaders() {
  const token = (await cookies()).get("mm_token")?.value;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
