import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      }
      setProfile(data);
    } catch (err) {
      console.error("Profile fetch exception:", err);
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        fetchProfile(authUser.id).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authUser = session?.user ?? null;
        setUser(authUser);
        if (authUser) {
          setLoading(true);
          await fetchProfile(authUser.id);
          setLoading(false);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
