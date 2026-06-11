import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { saveProfile } from "@/lib/storage";
import { useLanguage } from '@/lib/i18n';

import { CropSelectModal } from "@/components/CropSelectModal";
import { FloatingMic } from "@/components/FloatingMic";
import { ChatPopup } from "@/components/ChatPopup";
import { User, MapPin, Sprout, ArrowLeft, ArrowRight, Check } from "lucide-react";

const STATES = ["Karnataka", "Maharashtra", "Tamil Nadu", "Kerala", "Punjab", "Haryana"];
const CROPS = ["Rice", "Wheat", "Tomato", "Potato", "Onion", "Sugarcane", "Cotton", "Maize"];
const LANGUAGES = ["English", "Hindi", "Kannada", "Tamil", "Telugu", "Marathi"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, setLanguage } = useLanguage();

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
  // ROUTING GUARD & LOAD INITIAL PROFILE
  // -------------------------------------------------
  useEffect(() => {
    const onboardingAllowed = sessionStorage.getItem("onboardingAllowed") === "true";
    if (!onboardingAllowed) {
      // If not explicitly triggered by registration, redirect to dashboard
      navigate("/dashboard");
      return;
    }

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
        console.log("New user onboarding fresh");
      });
  }, [navigate]);

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
      // 1. Update profile in backend
      await api.put("/user/profile/update", {
        name: formData.name,
        state: formData.state,
        district: formData.district,
        village: formData.village,
        land_size: Number(formData.landSize),
        crops: formData.mainCrops.join(","),
        language: formData.language,
      });

      // 2. Fetch updated profile from backend
      const res = await api.get("/user/profile");

      // 3. Save profile locally
      saveProfile(res.data);

      toast({ title: "Profile completed successfully!" });

      // 4. Remove access flag and navigate to dashboard
      sessionStorage.removeItem("onboardingAllowed");
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
      if (!formData.state || !formData.district || !formData.village) {
        toast({ title: "Select state, district & village", variant: "destructive" });
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      submitProfile();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-1/4 -right-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <FloatingMic onClick={() => setIsChatOpen(true)} hasMessages={false} />
      <ChatPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onImageUpload={() => {}} />

      <CropSelectModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        selectedCrops={formData.mainCrops}
        onCropsChange={(crops) => setFormData((prev) => ({ ...prev, mainCrops: crops }))}
      />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative"
      >
        <Card className="p-8 space-y-8 shadow-2xl border-2 hover:border-primary/20 bg-card overflow-hidden relative">
          
          {/* Header */}
          <div className="text-center space-y-2 relative">
            <h1 className="text-3xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-2">
              <span>🌾</span> Kisan+ Onboarding
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Help us customize Kisan+ for your farm's success.
            </p>
          </div>

          {/* Progress Indicators & Tabs */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              {[
                { number: 1, label: "Basic Info", icon: User },
                { number: 2, label: "Location", icon: MapPin },
                { number: 3, label: "Farming Details", icon: Sprout },
              ].map((s) => (
                <div key={s.number} className="flex flex-col items-center gap-1.5 flex-1 relative">
                  {/* Line connector */}
                  {s.number > 1 && (
                    <div className={`absolute top-4 left-[-50%] right-[50%] h-0.5 -z-10 ${s.number <= step ? "bg-primary" : "bg-muted"}`} />
                  )}
                  
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                      step >= s.number
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                        : "bg-background border-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.number ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-bold ${step >= s.number ? "text-primary font-extrabold" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content Steps with Animations */}
          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('full_name')}</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder={t('enter_your_name')}
                      className="py-6 text-base"
                    />
                    <p className="text-xs text-muted-foreground">What should we call you when sharing farming tips?</p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('state')}</Label>
                      <Select value={formData.state} onValueChange={(val) => setFormData((prev) => ({ ...prev, state: val }))}>
                        <SelectTrigger className="py-6 text-sm">
                          <SelectValue placeholder={t('select_state')} />
                        </SelectTrigger>
                        <SelectContent>
                          {STATES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('district')}</Label>
                      <Input
                        value={formData.district}
                        onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                        placeholder={t('enter_district')}
                        className="py-6 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('village')}</Label>
                      <Input
                        value={formData.village}
                        onChange={(e) => setFormData((prev) => ({ ...prev, village: e.target.value }))}
                        placeholder={t('enter_village')}
                        className="py-6 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('land_size')} (acres)</Label>
                      <Input
                        value={formData.landSize}
                        onChange={(e) => setFormData((prev) => ({ ...prev, landSize: e.target.value.replace(/[^0-9.]/g, "") }))}
                        placeholder={t('example_land_size')}
                        className="py-6 text-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('main_crops')}</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                      {CROPS.map((crop) => (
                        <label
                          key={crop}
                          className={`flex items-center gap-2 p-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all ${
                            formData.mainCrops.includes(crop) ? "border-primary bg-primary/5 text-primary" : "border-slate-200"
                          }`}
                        >
                          <Checkbox
                            checked={formData.mainCrops.includes(crop)}
                            onCheckedChange={() => handleCropToggle(crop)}
                          />
                          <span className="text-xs font-bold">{crop}</span>
                        </label>
                      ))}

                      <button
                        onClick={() => setIsCropModalOpen(true)}
                        className="flex items-center justify-center gap-1.5 p-2.5 border border-dashed rounded-xl hover:border-primary text-primary font-bold transition-all text-xs"
                      >
                        <span>+ Other</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('preferred_language')}</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(val) => {
                        setFormData((prev) => ({ ...prev, language: val }));
                        setLanguage(val as any);
                      }}
                    >
                      <SelectTrigger className="py-6 text-sm">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 py-6 font-bold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            )}
            
            <Button
              onClick={nextStep}
              className="flex-1 py-6 font-extrabold flex items-center justify-center gap-2"
            >
              {step === 3 ? (
                <>
                  {t('finish')} <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  {t('next')} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

        </Card>
      </motion.div>
    </div>
  );
}
