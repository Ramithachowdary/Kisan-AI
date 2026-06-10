import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { saveProfile } from "@/lib/storage";

import { ArrowLeft, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { FloatingMic } from "@/components/FloatingMic";
import { ChatPopup } from "@/components/ChatPopup";
import api from "@/lib/api";
import { saveTokens } from "@/lib/storage";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  // --------------------------
  // LOGIN (phone + password)
  // --------------------------
  const handleLogin = async () => {
    if (mobile.length !== 10 || !password) {
      toast({ title: "Enter valid mobile and password", variant: "destructive" });
      return;
    }

    try {
      const res = await api.post("/auth/login", { phone: "+91" + mobile, password });
      saveTokens(res.data.access_token, res.data.refresh_token);

      const profileRes = await api.get("/user/profile");
      saveProfile(profileRes.data);

      toast({ title: "Login Successful!" });

      if (res.data.profile_complete === false) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      toast({ title: "Failed to login", variant: "destructive" });
    }
  };

  // --------------------------
  // VERIFY OTP & LOGIN BACKEND
  // --------------------------
// Firebase OTP flow removed. `handleSendOtp` performs login directly.


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
          onClick={() => navigate("/landing")}
          className="mb-4 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <Card className="p-8 space-y-6 shadow-2xl border-2 hover:border-primary/20">

          <div className="text-center space-y-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              🌾
            </motion.div>

            <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
            <p className="text-muted-foreground">Login or create account with your mobile number and password.</p>
          </div>

            <div className="space-y-4">
              <Label>Mobile Number</Label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={10}
                placeholder="10 digit mobile"
                className="text-lg py-3"
              />

              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="text-lg py-3"
              />

              <Button
                onClick={handleLogin}
                className="w-full py-6 text-lg"
              >
                <LogIn className="h-5 w-5 mr-2" /> Login / Create Account
              </Button>
            </div>

        </Card>
      </motion.div>
      
    </div>
  );
}
