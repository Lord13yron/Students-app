import { useState, useEffect } from "react";

import { View } from "react-native";
import { supabase } from "@/lib/supabase";
import Auth from "@/components/Auth";
import Account from "@/components/Account";

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getClaims().then((res) => {
      const claims = res.data?.claims ?? null;
      if (claims) {
        setUserId(claims.sub);
        setEmail(claims.email);
      } else {
        setUserId(null);
        setEmail(undefined);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      const res = await supabase.auth.getClaims();
      const claims = res.data?.claims ?? null;
      if (claims) {
        setUserId(claims.sub);
        setEmail(claims.email);
      } else {
        setUserId(null);
        setEmail(undefined);
      }
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <View>{userId ? <Account key={userId} /> : <Auth />}</View>
  );
}
