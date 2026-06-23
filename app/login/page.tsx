"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, KeyRound, Mail, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setUser } from "@/lib/redux/features/UserData/userDataSlice";

// Fixed particle positions to avoid hydration mismatch
const PARTICLES = [
  { width: 280, height: 220, top: 5, left: 10, duration: 18, delay: 0 },
  { width: 180, height: 300, top: 70, left: 80, duration: 22, delay: 2 },
  { width: 120, height: 120, top: 20, left: 50, duration: 15, delay: 4 },
  { width: 350, height: 200, top: 85, left: 30, duration: 20, delay: 1 },
  { width: 90, height: 90, top: 40, left: 90, duration: 25, delay: 3 },
  { width: 200, height: 250, top: 60, left: 5, duration: 17, delay: 5 },
  { width: 150, height: 180, top: 10, left: 70, duration: 19, delay: 2 },
  { width: 260, height: 140, top: 50, left: 40, duration: 23, delay: 0 },
];

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/users/login", { email, password });
      const userData = response.data.user;
      dispatch(setUser(userData));
      toast.success("Welcome back! Logging you in... ✨");
      router.push("/dashboard");
    } catch (error: any) {
      const msg = error.response?.data?.error || "Something went wrong. Try again!";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gray-950">
      {/* Animated background blobs */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-purple-500/8 animate-pulse"
              style={{
                width: `${p.width}px`,
                height: `${p.height}px`,
                top: `${p.top}%`,
                left: `${p.left}%`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-purple-600 rounded-2xl rotate-45 transform origin-center" />
            <div className="absolute inset-2 bg-blue-500 rounded-xl rotate-12 transform origin-center" />
            <div className="absolute inset-4 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ST</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            SkillTrade
          </h1>
          <p className="text-gray-400 text-center mt-1 text-sm">
            Continue your skill trading journey
          </p>
        </div>

        {/* Rank badges strip */}
        <div className="flex justify-center gap-2 mb-6">
          {[
            { rank: "D", color: "from-orange-500 to-orange-700" },
            { rank: "C", color: "from-green-500 to-green-700" },
            { rank: "B", color: "from-blue-500 to-blue-700" },
            { rank: "A", color: "from-purple-500 to-purple-700" },
            { rank: "S", color: "from-yellow-400 to-amber-600" },
          ].map((item) => (
            <div
              key={item.rank}
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br ${item.color} opacity-80 hover:opacity-100 transition-opacity`}
            >
              {item.rank}
            </div>
          ))}
        </div>

        {/* Login Card */}
        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm shadow-2xl shadow-purple-900/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Welcome back</CardTitle>
                <CardDescription className="text-gray-400 text-xs">
                  Enter your credentials to access your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-gray-300 text-sm">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="login-email"
                    placeholder="your.email@example.com"
                    type="email"
                    className="pl-10 bg-gray-800/70 border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 text-white placeholder:text-gray-600 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-password" className="text-gray-300 text-sm">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-gray-800/70 border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 text-white placeholder:text-gray-600 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                id="login-submit"
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition-all duration-200 shadow-lg shadow-purple-900/30 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Continue Quest <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gray-900 text-gray-500">New to SkillTrade?</span>
              </div>
            </div>

            <Link href="/register">
              <Button
                variant="outline"
                className="w-full border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50 text-gray-300 hover:text-white transition-all"
              >
                Create an Account
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-600 mt-6">
          By continuing, you agree to our{" "}
          <Link href="#" className="text-purple-400/70 hover:text-purple-400">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-purple-400/70 hover:text-purple-400">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}