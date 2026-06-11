import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { saveProfile, saveTokens } from "@/lib/storage";

import { ArrowLeft, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { FloatingMic } from "@/components/FloatingMic";
import { ChatPopup } from "@/components/ChatPopup";
import api from "@/lib/api";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSignup = async () => {
    if (mobile.length !== 10) {
      toast({ title: "Please enter a valid 10-digit mobile number", variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: "Please enter a password", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    try {
      // 1. Sign up the user
      const res = await api.post("/auth/signup", { phone: "+91" + mobile, password });
      saveTokens(res.data.access_token, res.data.refresh_token);

      // 2. Fetch and save user profile locally
      const profileRes = await api.get("/user/profile");
      saveProfile(profileRes.data);

      toast({ title: "Account Created Successfully!" });

      // 3. Mark onboarding as allowed and redirect
      sessionStorage.setItem("onboardingAllowed", "true");
      navigate("/onboarding");
    } catch (err: any) {
      console.error("SIGNUP ERROR:", err);
      const errorMsg = err.response?.data?.detail || "Failed to create account";
      toast({ title: errorMsg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4 relative">
      <FloatingMic onClick={() => setIsChatOpen(true)} hasMessages={false} />

      <ChatPopup
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onImageUpload={() => {}}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <Card className="p-8 space-y-6 shadow-2xl border-2 hover:border-primary/20 bg-card">
          <div className="text-center space-y-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-4"
            >
              🌱
            </motion.div>

            <h1 className="text-3xl font-bold text-primary">Create Account</h1>
            <p className="text-muted-foreground">Sign up to get personalized farming help and live mandi prices.</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Mobile Number</Label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                placeholder="10 digit mobile"
                className="text-lg py-3 mt-1"
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="text-lg py-3 mt-1"
              />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="text-lg py-3 mt-1"
              />
            </div>

            <Button
              onClick={handleSignup}
              className="w-full py-6 text-lg mt-2 font-bold"
            >
              <UserPlus className="h-5 w-5 mr-2" /> Sign Up
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-primary font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
