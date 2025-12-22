import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { saveProfile } from "@/lib/storage";

import { CropSelectModal } from "@/components/CropSelectModal";
import { FloatingMic } from "@/components/FloatingMic";
import { ChatPopup } from "@/components/ChatPopup";

const STATES = ["Karnataka", "Maharashtra", "Tamil Nadu", "Kerala", "Punjab", "Haryana"];
const CROPS = ["Rice", "Wheat", "Tomato", "Potato", "Onion", "Sugarcane", "Cotton", "Maize"];
const LANGUAGES = ["English", "Hindi", "Kannada", "Tamil", "Telugu", "Marathi"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    district: "",
    village: "",
    landSize: "",
    mainCrops: [] as string[],
    language: "English",
  });

  // -------------------------------------------------
  // FETCH EXISTING PROFILE FROM BACKEND
  // -------------------------------------------------
  useEffect(() => {
    api
      .get("/user/profile")
      .then((res) => {
        const p = res.data;

        setFormData({
          name: p.name || "",
          state: p.state || "",
          district: p.district || "",
          village: p.village || "",
          landSize: p.land_size || "",
          mainCrops: p.crops ? p.crops.split(",") : [],
          language: p.language || "English",
        });
      })
      .catch(() => {
        console.log("New user → onboarding starts fresh");
      });
  }, []);

  // -------------------------------------------------
  // CROP SELECT
  // -------------------------------------------------
  const handleCropToggle = (crop: string) => {
    if (crop === "Other") {
      setIsCropModalOpen(true);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      mainCrops: prev.mainCrops.includes(crop)
        ? prev.mainCrops.filter((c) => c !== crop)
        : [...prev.mainCrops, crop],
    }));
  };

  // -------------------------------------------------
  // SUBMIT TO BACKEND
  // -------------------------------------------------
  const submitProfile = async () => {
  if (formData.mainCrops.length === 0) {
    toast({ title: "Select at least one crop", variant: "destructive" });
    return;
  }

  try {
    // 1️⃣ Update profile in backend
    await api.put("/user/profile/update", {
      name: formData.name,
      state: formData.state,
      district: formData.district,
      village: formData.village,
      land_size: Number(formData.landSize),
      crops: formData.mainCrops.join(","),
      language: formData.language,
    });

    // 2️⃣ FETCH UPDATED PROFILE FROM BACKEND
    const res = await api.get("/user/profile");

    // 3️⃣ SAVE PROFILE LOCALLY (THIS WAS MISSING)
    saveProfile(res.data);

    toast({ title: "Profile saved!" });

    // 4️⃣ NOW REDIRECT
    navigate("/dashboard");
  } catch (err) {
    toast({ title: "Failed to save profile", variant: "destructive" });
  }
};


  // -------------------------------------------------
  // NEXT BUTTON HANDLER
  // -------------------------------------------------
  const nextStep = () => {
    if (step === 1) {
      if (!formData.name) {
        toast({ title: "Enter your name", variant: "destructive" });
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formData.state || !formData.district) {
        toast({ title: "Select state & district", variant: "destructive" });
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      submitProfile();
    }
  };

  // -------------------------------------------------
  // UI
  // -------------------------------------------------
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Floating Chat */}
      <FloatingMic onClick={() => setIsChatOpen(true)} hasMessages={false} />
      <ChatPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onImageUpload={() => {}} />

      {/* Crop Modal */}
      <CropSelectModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        selectedCrops={formData.mainCrops}
        onCropsChange={(crops) => setFormData((prev) => ({ ...prev, mainCrops: crops }))}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 space-y-6 shadow-2xl border-2 hover:border-primary/20 transition-all bg-gradient-to-br from-card via-card to-primary/5">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">Kisan+</h1>
            <p className="text-muted-foreground">Complete your profile</p>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          {/* Step 1 — Name */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </motion.div>
          )}

          {/* Step 2 — Location */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Label>State</Label>
              <Select value={formData.state} onValueChange={(val) => setFormData((prev) => ({ ...prev, state: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>District</Label>
              <Input
                value={formData.district}
                onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                placeholder="Enter district"
              />

              <Label>Village</Label>
              <Input
                value={formData.village}
                onChange={(e) => setFormData((prev) => ({ ...prev, village: e.target.value }))}
                placeholder="Enter village"
              />

              <Label>Land Size (acres)</Label>
              <Input
                value={formData.landSize}
                onChange={(e) => setFormData((prev) => ({ ...prev, landSize: e.target.value }))}
                placeholder="e.g., 2.5"
              />
            </motion.div>
          )}

          {/* Step 3 — Crops + Language */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Label>Main Crops</Label>
              <div className="grid grid-cols-2 gap-2">
                {CROPS.map((crop) => (
                  <label key={crop} className="flex items-center gap-2 p-2 border rounded hover:bg-muted cursor-pointer">
                    <Checkbox checked={formData.mainCrops.includes(crop)} onCheckedChange={() => handleCropToggle(crop)} />
                    <span className="text-sm">{crop}</span>
                  </label>
                ))}

                <button
                  onClick={() => setIsCropModalOpen(true)}
                  className="flex items-center gap-2 p-2 border rounded border-dashed hover:border-primary"
                >
                  <span className="text-sm font-medium text-primary">+ Other</span>
                </button>
              </div>

              <Label>Preferred Language</Label>
              <Select
                value={formData.language}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, language: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            <Button onClick={nextStep} className="flex-1">
              {step === 3 ? "Finish" : "Next"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
