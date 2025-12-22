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

import { auth, initRecaptcha, sendOtpPhone } from "@/lib/firebase";
import api from "@/lib/api";
import { saveTokens } from "@/lib/storage";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // --------------------------
  // SEND OTP
  // --------------------------
  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      toast({
        title: "Enter valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    try {
      const verifier = initRecaptcha(); // MUST exist before calling

      const confirmation = await sendOtpPhone("+91" + mobile, verifier);
      window.confirmationResult = confirmation;

      setOtpSent(true);
      toast({ title: "OTP Sent!", description: "Check your SMS" });
    } catch (err) {
      console.error("OTP SEND ERROR:", err);
      toast({ title: "Failed to send OTP", variant: "destructive" });
    }
  };

  // --------------------------
  // VERIFY OTP & LOGIN BACKEND
  // --------------------------
const handleLogin = async () => {
  if (!otp) {
    toast({ title: "Enter OTP", variant: "destructive" });
    return;
  }

  try {
    const result = await window.confirmationResult.confirm(otp);
    const idToken = await result.user.getIdToken(true);

    const res = await api.post(
      "/auth/login",
      {},
      {
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );

    // 1️⃣ Save tokens
    saveTokens(res.data.access_token, res.data.refresh_token);

    // 2️⃣ FETCH PROFILE FROM BACKEND
    const profileRes = await api.get("/user/profile");

    // 3️⃣ SAVE PROFILE LOCALLY (THIS WAS MISSING)
    saveProfile(profileRes.data);

    toast({ title: "Login Successful!" });

    // 4️⃣ Navigate based on completion
    if (res.data.profile_complete === false) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }

  } catch (err) {
    console.error("OTP VERIFY ERROR:", err);
    toast({ title: "Invalid OTP", variant: "destructive" });
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
            <p className="text-muted-foreground">Login to continue to Kisan+</p>
          </div>

          {!otpSent ? (
            <div className="space-y-4">
              <Label>Mobile Number</Label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={10}
                placeholder="10 digit mobile"
                className="text-lg py-6"
              />

              <Button
                onClick={handleSendOtp}
                className="w-full py-6 text-lg"
              >
                Send OTP
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Label>Enter OTP</Label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder="6-digit OTP"
                className="text-lg py-6 text-center tracking-widest"
              />

              <Button
                onClick={handleLogin}
                className="w-full py-6 text-lg"
              >
                <LogIn className="h-5 w-5 mr-2" /> Login
              </Button>

              <Button
                variant="ghost"
                onClick={() => { setOtpSent(false); setOtp(""); }}
                className="w-full hover:bg-muted"
              >
                Change Mobile Number
              </Button>
              {/* ALWAYS PRESENT — REQUIRED FOR OTP
              // <div id="recaptcha-container"></div> */}
            </div>
          )}

        </Card>
      </motion.div>
      {/* ALWAYS PRESENT — REQUIRED FOR OTP */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
