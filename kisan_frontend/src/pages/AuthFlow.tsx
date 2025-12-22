import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { auth, initRecaptcha, sendOtpPhone } from "@/lib/firebase";

import api from "@/lib/api";
import { saveTokens } from "@/lib/storage";

import { FloatingMic } from "@/components/FloatingMic";
import { ChatPopup } from "@/components/ChatPopup";
import { CropSelectModal } from "@/components/CropSelectModal";

const STATES = ["Karnataka", "Maharashtra", "Tamil Nadu", "Kerala", "Punjab", "Haryana"];
const CROPS = ["Rice", "Wheat", "Tomato", "Potato", "Onion", "Sugarcane", "Cotton", "Maize"];
const LANGUAGES = ["English", "Hindi", "Kannada", "Tamil", "Telugu", "Marathi"];

export default function AuthFlow() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [step, setStep] = useState<"login" | 1 | 2 | 3>("login");
  
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    district: "",
    village: "",
    landSize: "",
    mainCrops: [] as string[],
    language: "English",
  });

  // ---------------------------------------------------------
  // SEND OTP
  // ---------------------------------------------------------
  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      toast({ title: "Enter valid 10-digit mobile", variant: "destructive" });
      return;
    }

    try {
      const verifier = initRecaptcha();
      const confirmation = await sendOtpPhone("+91" + mobile, verifier);
      window.confirmationResult = confirmation;

      setOtpSent(true);
      toast({ title: "OTP Sent!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to send OTP", variant: "destructive" });
    }
  };

  // ---------------------------------------------------------
  // VERIFY OTP → BACKEND LOGIN → CHECK PROFILE
  // ---------------------------------------------------------
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
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      saveTokens(res.data.access_token, res.data.refresh_token);

      if (res.data.profile_complete) {
        navigate("/dashboard");
        return;
      }

      // NEW USER → SHOW ONBOARDING STEP 1
      setStep(1);

    } catch (err) {
      console.error(err);
      toast({ title: "Invalid OTP", variant: "destructive" });
    }
  };

  // ---------------------------------------------------------
  // CROPS
  // ---------------------------------------------------------
  const toggleCrop = (crop: string) => {
    if (crop === "Other") {
      setIsCropModalOpen(true);
      return;
    }
    setFormData(prev => ({
      ...prev,
      mainCrops: prev.mainCrops.includes(crop)
        ? prev.mainCrops.filter(c => c !== crop)
        : [...prev.mainCrops, crop]
    }));
  };

  // ---------------------------------------------------------
  // SUBMIT PROFILE
  // ---------------------------------------------------------
  const submitProfile = async () => {
    try {
      await api.put("/user/profile/update", {
        name: formData.name,
        state: formData.state,
        district: formData.district,
        village: formData.village,
        land_size: Number(formData.landSize),
        crops: formData.mainCrops.join(","),
        language: formData.language,
      });

      toast({ title: "Profile completed!" });
      navigate("/dashboard");

    } catch (err) {
      toast({ title: "Failed to save profile", variant: "destructive" });
    }
  };

  // ---------------------------------------------------------
  // NEXT BUTTON
  // ---------------------------------------------------------
  const next = () => {
    if (step === 1) {
      if (!formData.name) return toast({ title: "Enter your name", variant: "destructive" });
      setStep(2);
    } 
    else if (step === 2) {
      if (!formData.state || !formData.district)
        return toast({ title: "Select state & district", variant: "destructive" });
      setStep(3);
    } 
    else if (step === 3) {
      submitProfile();
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">

      <FloatingMic onClick={() => setIsChatOpen(true)} hasMessages={false} />
      <ChatPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onImageUpload={() => {}} />

      <CropSelectModal 
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        selectedCrops={formData.mainCrops}
        onCropsChange={(crops) => setFormData(prev => ({ ...prev, mainCrops: crops }))}
      />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="p-8 space-y-6 border-2 shadow-xl bg-card">

          {/* Login View */}
          {step === "login" && (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-primary">Kisan+</h1>
                <p>Login to continue</p>
              </div>

              {!otpSent ? (
                <div className="space-y-4">
                  <Label>Mobile Number</Label>
                  <Input 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    maxLength={10}
                    placeholder="10-digit mobile"
                  />

                  <Button className="w-full py-5 text-lg" onClick={handleSendOtp}>
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
                    className="text-center tracking-widest text-lg"
                  />

                  <Button className="w-full py-5 text-lg" onClick={handleLogin}>
                    Verify & Continue
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                  >
                    Change Mobile Number
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Onboarding Steps */}
          {step !== "login" && (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-primary">Complete Your Profile</h1>
              </div>

              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Label>State</Label>
                  <Select 
                    value={formData.state}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, state: val }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Label>District</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  />

                  <Label>Village</Label>
                  <Input
                    value={formData.village}
                    onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                  />

                  <Label>Land Size (acres)</Label>
                  <Input
                    value={formData.landSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, landSize: e.target.value }))}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <Label>Main Crops</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CROPS.map(crop => (
                      <label key={crop} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                        <Checkbox checked={formData.mainCrops.includes(crop)} onCheckedChange={() => toggleCrop(crop)} />
                        <span>{crop}</span>
                      </label>
                    ))}

                    <button
                      onClick={() => setIsCropModalOpen(true)}
                      className="flex items-center gap-2 p-2 border rounded border-dashed"
                    >
                      <span className="text-primary">+ Other</span>
                    </button>
                  </div>

                  <Label>Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, language: val }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2">
                {step > 1 && (
                  <Button variant="outline" className="flex-1" onClick={() => setStep(prev => ((prev as number) - 1) as any)}>
                      Back
                    </Button>
                )}

                <Button className="flex-1" onClick={next}>
                  {step === 3 ? "Finish" : "Next"}
                </Button>
              </div>

            </>
          )}

        </Card>
      </motion.div>

      <div id="recaptcha-container"></div>
    </div>
  );
}
