import ThemedView from "@/components/ThemedView";
import Account from "@/components/Account";
import useUser from "@/hooks/useUser";
import Auth from "@/components/Auth";

const settings = () => {
  const { profile } = useUser();
  return (
    <ThemedView>{profile ? <Account key={profile.id} /> : <Auth />}</ThemedView>
  );
};

export default settings;
