import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";

export async function getSession() {
  return await getServerSession(authOptions);
}
