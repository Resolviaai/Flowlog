import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
import { hapticFeedback } from "../utils/haptics";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Logged in successfully");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        
        if (data.user) {
          // Create profile if it doesn't exist (though usually handled by triggers)
          // But we'll do it manually just in case or to be sure
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            username,
            full_name: fullName,
            email,
            role: 'editor', // default
          });
          if (profileError) console.error("Profile creation error:", profileError);
        }
        
        toast.success("Signed up successfully! Please check your email.");
      }
      hapticFeedback('success');
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
      hapticFeedback('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-6 justify-center max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Resolvia</h1>
        <p className="text-text-secondary">{isLogin ? "Welcome back" : "Create your account"}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="johndoe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="John Doe"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-accent hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
