import { getHouseholdId, getProfile } from "@/lib/data-services";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/types";
import { User } from "@supabase/supabase-js";
import { createContext, useEffect, useState, type ReactNode } from "react";
import { Alert } from "react-native";

type UserContextValue = {
  user: User | null;
  authChecked: boolean;
  profile: Profile | null;
  householdId: string | null | undefined;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const UserContext = createContext<UserContextValue | undefined>(
  undefined,
);

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [householdId, setHouseholdId] = useState<string | null | undefined>(
    undefined,
  );

  useEffect(() => {
    // initial fetch
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthChecked(true);
    });

    // listen for login / logout / token refresh
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // fetch profile + household whenever the user id changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setHouseholdId(null);
      return;
    }
    let active = true;
    Promise.all([getProfile(user.id), getHouseholdId(user.id)]).then(
      ([p, h]) => {
        if (!active) return;
        setProfile(p);
        setHouseholdId(h);
      },
    );
    return () => {
      active = false;
    };
  }, [user?.id]);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) Alert.alert(error.message);
  }

  async function register(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert(error.message);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function refreshProfile() {
    if (!user) return;
    const p = await getProfile(user.id);
    setProfile(p);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        authChecked,
        profile,
        householdId,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
