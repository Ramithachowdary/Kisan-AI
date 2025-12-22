import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { getProfile, saveProfile } from '@/lib/storage';
import { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const STATES = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Kerala', 'Punjab', 'Haryana'];
const CROPS = ['Rice', 'Wheat', 'Tomato', 'Potato', 'Onion', 'Sugarcane', 'Cotton', 'Maize'];
const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi'];

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (p) {
      setProfile(p);
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);
  const selectedCrops = profile?.crops ? profile.crops.split(","): [];


const handleCropToggle = (crop: string) => {
  if (!profile) return;

  const crops = selectedCrops.includes(crop)
    ? selectedCrops.filter(c => c !== crop)
    : [...selectedCrops, crop];

  setProfile({
    ...profile,
    crops: crops.join(","),
  });
};


  const handleSave = () => {
    if (profile) {
      saveProfile(profile);
      toast({ title: "Profile updated!" });
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background w-full">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-primary mb-6">Profile Settings</h1>
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select
              value={profile.state}
              onValueChange={val => setProfile({ ...profile, state: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATES.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              value={profile.district}
              onChange={e => setProfile({ ...profile, district: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="village">Village</Label>
            <Input
              id="village"
              value={profile.village}
              onChange={e => setProfile({ ...profile, village: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="land">Land Size (acres)</Label>
            <Input
              id="land"
              value={profile.land_size}
              onChange={e => setProfile({ ...profile, land_size: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Main Crops</Label>
            <div className="grid grid-cols-2 gap-2">
              {CROPS.map(crop => (
                <label
                  key={crop}
                  className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted"
                >
                  <Checkbox
                    checked={selectedCrops.includes(crop)}
                    onCheckedChange={() => handleCropToggle(crop)}
                  />
                  <span className="text-sm">{crop}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Language</Label>
            <Select
              value={profile.language}
              onValueChange={val => setProfile({ ...profile, language: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="demo">Use Demo Data</Label>
              <p className="text-sm text-muted-foreground">
                Use mock API responses for testing
              </p>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Profile
          </Button>
        </Card>
      </main>
    </div>
  );
}
