import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { supabase } from "@/lib/supabase";

export default function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}

export async function getProfiles() {
  const { data, error } = await supabase.from("profiles").select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}
