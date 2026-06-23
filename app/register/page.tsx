"use client";

import { toast } from "react-hot-toast";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle,
  KeyRound,
  Mail,
  Shield,
  User,
  X,
  Plus,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

const POPULAR_SKILLS = [
  "JavaScript", "Python", "React", "Node.js", "TypeScript",
  "UI/UX Design", "Data Science", "Machine Learning", "SQL",
  "CSS", "Java", "C++", "DevOps", "Figma", "GoLang",
];

// Fixed particles to avoid hydration mismatch
const PARTICLES = [
  { width: 280, height: 220, top: 5, left: 10, duration: 18, delay: 0 },
  { width: 180, height: 300, top: 70, left: 80, duration: 22, delay: 2 },
  { width: 120, height: 120, top: 20, left: 50, duration: 15, delay: 4 },
  { width: 350, height: 200, top: 85, left: 30, duration: 20, delay: 1 },
  { width: 90, height: 90, top: 40, left: 90, duration: 25, delay: 3 },
  { width: 200, height: 250, top: 60, left: 5, duration: 17, delay: 5 },
];

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [step, setStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const [skillsToTeach, setSkillsToTeach] = useState<string[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [customSkillTeach, setCustomSkillTeach] = useState("");
  const [customSkillLearn, setCustomSkillLearn] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    let strength = 0;
    if (val.length > 0) strength += 20;
    if (val.length > 7) strength += 20;
    if (/[A-Z]/.test(val)) strength += 20;
    if (/[0-9]/.test(val)) strength += 20;
    if (/[^A-Za-z0-9]/.test(val)) strength += 20;
    setPasswordStrength(strength);
  };

  const toggleSkill = (skill: string, type: "teach" | "learn") => {
    if (type === "teach") {
      setSkillsToTeach((prev) =>
        prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
      );
    } else {
      setSkillsToLearn((prev) =>
        prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
      );
    }
  };

  const addCustomSkill = (type: "teach" | "learn") => {
    if (type === "teach" && customSkillTeach.trim()) {
      const s = customSkillTeach.trim();
      if (!skillsToTeach.includes(s)) setSkillsToTeach((prev) => [...prev, s]);
      setCustomSkillTeach("");
    }
    if (type === "learn" && customSkillLearn.trim()) {
      const s = customSkillLearn.trim();
      if (!skillsToLearn.includes(s)) setSkillsToLearn((prev) => [...prev, s]);
      setCustomSkillLearn("");
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setStep(2);
  };

  const handleSkillsStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/users/register", {
        username,
        email,
        password,
        skillsToTeach,
        skillsToLearn,
        currentlyLearning: skillsToLearn[0] ?? "",
      });
      toast.success("Account created! Check your email to verify. 🎉");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const TOTAL_STEPS = 3;
  const progressValue = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gray-950">
      {/* Background */}
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
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-14 h-14 mb-3">
            <div className="absolute inset-0 bg-purple-600 rounded-2xl rotate-45 transform origin-center" />
            <div className="absolute inset-1.5 bg-blue-500 rounded-xl rotate-12 transform origin-center" />
            <div className="absolute inset-3 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Join SkillTrade
          </h1>
          <p className="text-gray-400 text-center mt-1 text-sm">
            Start your skill trading adventure
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4 px-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span
              className={step >= 1 ? "text-purple-400 font-medium" : ""}
            >
              Account
            </span>
            <span className={step >= 2 ? "text-purple-400 font-medium" : ""}>
              Skills
            </span>
            <span className={step >= 3 ? "text-purple-400 font-medium" : ""}>
              Password
            </span>
          </div>
          <Progress
            value={progressValue}
            className="h-1.5 bg-gray-800"
          />
        </div>

        {/* Card */}
        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm shadow-2xl shadow-purple-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                {step === 1 ? (
                  <User className="h-4 w-4 text-purple-400" />
                ) : step === 2 ? (
                  <BookOpen className="h-4 w-4 text-purple-400" />
                ) : (
                  <Shield className="h-4 w-4 text-purple-400" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg text-white">
                  {step === 1
                    ? "Create Account"
                    : step === 2
                    ? "Set Your Skills"
                    : "Secure Your Account"}
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs">
                  {step === 1
                    ? "Step 1 of 3 — Basic info"
                    : step === 2
                    ? "Step 2 of 3 — What you know & want to learn"
                    : "Step 3 of 3 — Create a strong password"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-username" className="text-gray-300 text-sm">
                    Username
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      id="reg-username"
                      placeholder="Choose a unique username"
                      className="pl-10 bg-gray-800/70 border-gray-700 focus:border-purple-500 text-white placeholder:text-gray-600 transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-gray-300 text-sm">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      id="reg-email"
                      placeholder="your.email@example.com"
                      type="email"
                      className="pl-10 bg-gray-800/70 border-gray-700 focus:border-purple-500 text-white placeholder:text-gray-600 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  id="reg-step1-next"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-purple-900/30 mt-2"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}

            {/* STEP 2: Skills */}
            {step === 2 && (
              <form onSubmit={handleSkillsStep} className="space-y-5">
                {/* Skills to Teach */}
                <div>
                  <Label className="text-gray-300 text-sm mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    Skills I can teach
                    {skillsToTeach.length > 0 && (
                      <span className="ml-auto text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                        {skillsToTeach.length} selected
                      </span>
                    )}
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {POPULAR_SKILLS.map((skill) => (
                      <button
                        key={`teach-${skill}`}
                        type="button"
                        onClick={() => toggleSkill(skill, "teach")}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          skillsToTeach.includes(skill)
                            ? "bg-purple-600/30 border-purple-500 text-purple-200"
                            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-purple-600/50 hover:text-gray-300"
                        }`}
                      >
                        {skillsToTeach.includes(skill) && "✓ "}
                        {skill}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom skill..."
                      className="bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-600 text-sm h-8"
                      value={customSkillTeach}
                      onChange={(e) => setCustomSkillTeach(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill("teach"))}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-gray-700 h-8 px-2"
                      onClick={() => addCustomSkill("teach")}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Skills to Learn */}
                <div>
                  <Label className="text-gray-300 text-sm mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                    Skills I want to learn
                    {skillsToLearn.length > 0 && (
                      <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                        {skillsToLearn.length} selected
                      </span>
                    )}
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {POPULAR_SKILLS.map((skill) => (
                      <button
                        key={`learn-${skill}`}
                        type="button"
                        onClick={() => toggleSkill(skill, "learn")}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          skillsToLearn.includes(skill)
                            ? "bg-blue-600/30 border-blue-500 text-blue-200"
                            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-blue-600/50 hover:text-gray-300"
                        }`}
                      >
                        {skillsToLearn.includes(skill) && "✓ "}
                        {skill}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom skill..."
                      className="bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-600 text-sm h-8"
                      value={customSkillLearn}
                      onChange={(e) => setCustomSkillLearn(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill("learn"))}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-gray-700 h-8 px-2"
                      onClick={() => addCustomSkill("learn")}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-400 hover:text-white"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    id="reg-step2-next"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: Password + Terms */}
            {step === 3 && (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className="text-gray-300 text-sm">
                    Password
                  </Label>
                  <div className="relative group">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Create a strong password"
                      className="pl-10 bg-gray-800/70 border-gray-700 focus:border-purple-500 text-white placeholder:text-gray-600 transition-all"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  {password && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Strength:</span>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength < 40
                              ? "text-red-400"
                              : passwordStrength < 80
                              ? "text-yellow-400"
                              : "text-green-400"
                          }`}
                        >
                          {passwordStrength < 40 ? "Weak" : passwordStrength < 80 ? "Good" : "Strong"}
                        </span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordStrength < 40
                              ? "bg-red-500"
                              : passwordStrength < 80
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm-password" className="text-gray-300 text-sm">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      id="reg-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10 bg-gray-800/70 border-gray-700 focus:border-purple-500 text-white placeholder:text-gray-600 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  {confirmPassword && (
                    <p
                      className={`text-xs flex items-center gap-1 ${
                        password === confirmPassword ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle className="h-3 w-3" /> Passwords match
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3" /> Passwords do not match
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* Skills summary */}
                {(skillsToTeach.length > 0 || skillsToLearn.length > 0) && (
                  <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400 space-y-1">
                    {skillsToTeach.length > 0 && (
                      <div>
                        <span className="text-purple-400 font-medium">Teaching:</span>{" "}
                        {skillsToTeach.slice(0, 3).join(", ")}
                        {skillsToTeach.length > 3 && ` +${skillsToTeach.length - 3} more`}
                      </div>
                    )}
                    {skillsToLearn.length > 0 && (
                      <div>
                        <span className="text-blue-400 font-medium">Learning:</span>{" "}
                        {skillsToLearn.slice(0, 3).join(", ")}
                        {skillsToLearn.length > 3 && ` +${skillsToLearn.length - 3} more`}
                      </div>
                    )}
                  </div>
                )}

                {/* Terms */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="mt-0.5 border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link href="#" className="text-purple-400 hover:text-purple-300">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-purple-400 hover:text-purple-300">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-400 hover:text-white"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    id="reg-submit"
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-900/30"
                    disabled={isLoading || !agreedToTerms || password !== confirmPassword}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Create Account <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already on a quest?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}