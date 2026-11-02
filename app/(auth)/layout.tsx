import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("feature_token");

  if (token) {
    return redirect("/");
  }
  return <> {children}</>;
}
