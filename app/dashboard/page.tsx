import { createClient } from "@/lib/supabaseServer";
import LogoutButton from "@/components/logout-button";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = user?.user_metadata?.full_name || "User";

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">
        Welcome, {name} 👋
      </h1>

      <div className="mt-4">
        <LogoutButton />
      </div>
    </div>
  );
}