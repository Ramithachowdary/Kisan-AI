import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Upload, Image as ImageIcon, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DiagnosisCard } from '@/components/DiagnosisCard';
import { DiagnosisResult } from '@/lib/types';
import { saveToHistory } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import earlyBlightImg from '@/assets/early-blight.jpg';
import yellowLeafSpotImg from '@/assets/yellow-leaf-spot.jpg';
import axios from "axios";

// Top Indian crops
const CROPS = [
  'Tomato', 'Rice', 'Wheat', 'Maize', 'Cotton', 
  'Sugarcane', 'Onion', 'Potato', 'Paddy', 'Groundnut', 'Pepper'
];

// Map API disease to scientific name and advice
const DISEASE_INFO: Record<string, { scientific: string, advice: string[] }> = {
  Baterial_Spot_Detected: {
    scientific: "Xanthomonas campestris",
    advice: ["Remove infected areas", "Use copper-based fungicides"]
  },
  Pepper_healthy: {
    scientific: "Capsicum annuum",
    advice: ["No action needed"]
  },
  Potato_early_blight: {
    scientific: "Alternaria solani",
    advice: ["Destroy infected leaves", "Apply recommended fungicide"]
  },
  Potato_healthy: {
    scientific: "Solanum tuberosum",
    advice: ["No action needed"]
  },
};

export default function Diagnosis() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [diagnosisCards, setDiagnosisCards] = useState<DiagnosisResult[]>([]);

  useEffect(() => {
    const file = location.state?.file;
    if (file) handleFile(file);
  }, [location.state]);

  // Reads uploaded file and sets selectedImage as DataURL
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setSelectedImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Calls FastAPI ML backend for actual crop image prediction
  const handleAnalyze = async () => {
    if (!selectedImage || !selectedCrop) {
      toast({
        title: "Missing information",
        description: "Please select a crop and image",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    // Convert base64 DataURL to Blob
    const byteString = atob(selectedImage.split(',')[1]);
    const mimeString = selectedImage.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });

    const formData = new FormData();
    formData.append("image", blob, "uploaded.jpg");

    try {
      const res = await axios.post("http://127.0.0.1:8000/predict", formData);
      const data = res.data;

      // Confidence to status; ensures correct TS union type
      let status: "high" | "medium" | "low" =
        data.confidence >= 0.8 ? "high"
        : data.confidence >= 0.5 ? "medium"
        : "low";

      // Optional mapping: get scientific name/advice per disease
      const info = DISEASE_INFO[data.predicted_disease] || { scientific: '', advice: [] };

      const newDiagnosis: DiagnosisResult = {
        disease: data.predicted_disease,
        confidence: data.confidence,
        status,
        timestamp: new Date().toISOString(),
        image: selectedImage!,
        advice: info.advice,
        scientific: info.scientific,
      };

      setDiagnosisCards(prev => [...prev, newDiagnosis]);
      saveToHistory({
        id: Date.now().toString(),
        query: `${selectedCrop} diagnosis`,
        type: 'diagnosis',
        timestamp: new Date().toISOString(),
        preview: newDiagnosis.disease,
        data: newDiagnosis
      });

      toast({
        title: newDiagnosis.status === 'high' ? "✓ High confidence" : "⚠ Medium/Low confidence",
        description: newDiagnosis.disease
      });
    } catch (err) {
      toast({
        title: "Prediction failed",
        description: err?.toString(),
        variant: "destructive"
      });
    }

    setIsAnalyzing(false);
    setSelectedImage(null);
    setSelectedCrop('');
  };


  return (
    <div className="min-h-screen bg-background w-full">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Crop Diagnosis</h1>
          <p className="text-muted-foreground">Select crop and upload image for AI analysis</p>
        </div>

        {/* Crop Selection */}
        <Card className="mb-6 p-4">
          <label className="text-sm font-medium mb-2 block">Select Your Crop</label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose crop type..." />
            </SelectTrigger>
            <SelectContent>
              {CROPS.map(crop => (
                <SelectItem key={crop} value={crop}>{crop}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {diagnosisCards.length === 0 ? (
          <div className="space-y-6">
            {/* Image preview or upload */}
            {selectedImage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-4">
                  <img 
                    src={selectedImage} 
                    alt="Selected crop" 
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex-1"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Image'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedImage(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card 
                  className="p-8 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Take Photo</h3>
                      <p className="text-sm text-muted-foreground">
                        Capture image of affected crop
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-8 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Upload Photo</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose from gallery
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="text-center text-sm text-muted-foreground">
                  <p>📸 Tips for best results:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Clear, well-lit photo</li>
                    <li>• Focus on affected leaves/fruit</li>
                    <li>• Avoid blurry images</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Analysis animation */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-background/95 flex items-center justify-center z-50"
              >
                <Card className="p-8 text-center space-y-4 max-w-sm mx-4">
                  <div className="relative h-32 w-32 mx-auto">
                    <div className="absolute inset-0 animate-scan border-t-2 border-primary rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 text-primary">
                        🌿
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Analyzing Image</h3>
                    <p className="text-sm text-muted-foreground">
                      AI is examining your crop...
                    </p>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Display all diagnosis cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {diagnosisCards.map((diagnosis, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <img 
                        src={diagnosis.image} 
                        alt={diagnosis.disease}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{diagnosis.disease}</h3>
                            <p className="text-xs text-muted-foreground">{diagnosis.scientific}</p>
                          </div>
                          <Badge 
                            variant={diagnosis.status === 'high' ? 'default' : 'secondary'}
                            className="flex items-center gap-1"
                          >
                            {diagnosis.status === 'high' ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {Math.round(diagnosis.confidence * 100)}%
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium">Treatment Plan:</p>
                          {diagnosis.advice.map((advice, i) => (
                            <p key={i} className="text-xs text-muted-foreground">• {advice}</p>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => toast({ title: "Saved to history!" })}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm"
                            className="flex-1"
                            onClick={() => toast({ title: "Opening full report..." })}
                          >
                            View Full Report
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setDiagnosisCards([]);
                setSelectedImage(null);
                setSelectedCrop('');
              }}
              className="w-full"
            >
              Start New Diagnosis
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </main>
    </div>
  );
}
