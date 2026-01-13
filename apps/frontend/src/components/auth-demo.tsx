import { headers } from "next/headers";

export default async function AuthClient() {
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div>
      {session ? (
        <div>
          <p>User: {session.user.name}</p>
          <p>Email: {session.user.email}</p>
        </div>
      ) : (
        <div>
          <p>Not signed in</p>
        </div>
      )}
    </div>
  );
}
