"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/login");
  };
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setName(data.user?.user_metadata?.full_name || "User");
    };

    getUser();
  }, []);

  return (
    <div>
        
      <h1>Welcome, {name} 👋</h1>
      <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}