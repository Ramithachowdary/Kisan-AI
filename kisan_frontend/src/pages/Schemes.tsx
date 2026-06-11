import { useState } from 'react';
import { Search, Volume2, Cloud, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { SpeechSynthesisService } from '@/lib/speech';
import { useLanguage } from '@/lib/i18n';

const CATEGORIES = [
  'All',
  'Income Support',
  'Insurance',
  'Credit',
  'Soil Management',
  'Organic Farming',
  'Water Management'
];

const SCHEMES_DATA = [
  {
    id: '1',
    title: 'PM-KISAN',
    category: 'Income Support',
    status: 'Active',
    description: 'Pradhan Mantri Kisan Samman Nidhi provides income support of Rs. 6000 per year to farmer families.',
    benefits: '₹2000 every 4 months',
    eligibility: 'All landholding farmer families',
    deadline: '2024-03-31',
    location: 'All India'
  },
  {
    id: '2',
    title: 'Crop Insurance Scheme (PMFBY)',
    category: 'Insurance',
    status: 'Registration Open',
    description: 'Pradhan Mantri Fasal Bima Yojana provides comprehensive crop insurance against natural calamities.',
    benefits: 'Up to ₹2 lakh insurance coverage',
    eligibility: 'All farmers growing notified crops',
    deadline: '2024-09-30',
    location: 'All India'
  },
  {
    id: '3',
    title: 'Kisan Credit Card (KCC)',
    category: 'Credit',
    status: 'Active',
    description: 'Provides farmers with affordable credit for agricultural needs.',
    benefits: 'Credit up to ₹3 lakh at 4% interest',
    eligibility: 'Farmers with landholding/crop loan eligibility',
    deadline: '2024-12-31',
    location: 'All India'
  },
  {
    id: '4',
    title: 'Soil Health Card Scheme',
    category: 'Soil Management',
    status: 'Active',
    description: 'Provides soil health cards to farmers with crop-wise recommendations for nutrients and fertilizers.',
    benefits: 'Free soil testing every 2 years',
    eligibility: 'All farmers',
    deadline: '2024-12-31',
    location: 'All India'
  },
  {
    id: '5',
    title: 'National Mission on Natural Farming',
    category: 'Organic Farming',
    status: 'Active',
    description: 'Promotes natural farming practices without synthetic chemicals.',
    benefits: '₹50,000 per hectare support over 3 years',
    eligibility: 'Farmers adopting natural farming',
    deadline: '2024-12-31',
    location: 'All India'
  },
  {
    id: '6',
    title: 'Pradhan Mantri Krishi Sinchayee Yojana',
    category: 'Water Management',
    status: 'Active',
    description: 'Financial assistance for micro irrigation systems - per drop more crop.',
    benefits: 'Up to 70% subsidy on drip irrigation',
    eligibility: 'Small and marginal farmers in water-scarce regions',
    deadline: '2024-06-30',
    location: 'All India'
  },
  {
    id: '7',
    title: 'Agriculture Infrastructure Fund',
    category: 'Credit',
    status: 'Active',
    description: 'Financing facility for investment in post-harvest management infrastructure.',
    benefits: 'Loans up to ₹50 lakh',
    eligibility: 'Farmers, processors, exporters',
    deadline: '2024-12-31',
    location: 'All India'
  },
  {
    id: '8',
    title: 'Paramparagat Krishi Vikas Yojana',
    category: 'Organic Farming',
    status: 'Active',
    description: 'Promotes organic farming through cluster-based approach and collective certification.',
    benefits: '₹50,000 per hectare support',
    eligibility: 'Farmer groups practicing organic farming',
    deadline: '2024-12-31',
    location: 'All India'
  },
  {
    id: '9',
    title: 'Rashtriya Krishi Vikas Yojana',
    category: 'Soil Management',
    status: 'Active',
    description: 'Support for sustainable agriculture and soil health development.',
    benefits: 'Infrastructure grants & training programs',
    eligibility: 'Farmer organizations and cooperatives',
    deadline: '2024-12-31',
    location: 'All India'
  },
  {
    id: '10',
    title: 'Pradhan Mantri Kisan Sampada Yojana',
    category: 'Credit',
    status: 'Active',
    description: 'Agri-processing support to boost farm incomes through value addition.',
    benefits: 'Funding for cold storage and processing units',
    eligibility: 'Food processing enterprises and farmers',
    deadline: '2024-12-31',
    location: 'All India'
  },
  {
    id: '11',
    title: 'Tamil Nadu Farmers Welfare Scheme',
    category: 'Income Support',
    status: 'Active',
    description: 'State-specific welfare scheme for small and marginal farmers in Tamil Nadu.',
    benefits: '₹5000 per acre per year support',
    eligibility: 'Small and marginal farmers in Tamil Nadu',
    deadline: '2024-12-31',
    location: 'Tamil Nadu'
  },
  {
    id: '12',
    title: 'Kerala State Agricultural Development',
    category: 'Soil Management',
    status: 'Active',
    description: 'Integrated farming development program for Kerala farmers with modern techniques.',
    benefits: 'Training & equipment subsidies',
    eligibility: 'All farmers in Kerala',
    deadline: '2024-12-31',
    location: 'Kerala'
  },
  {
    id: '13',
    title: 'UP Kisan Pension Yojana',
    category: 'Income Support',
    status: 'Active',
    description: 'Pension scheme for elderly farmers in Uttar Pradesh providing financial security.',
    benefits: '₹500-1000 per month pension',
    eligibility: 'Farmers aged 60+ in Uttar Pradesh',
    deadline: '2024-12-31',
    location: 'Uttar Pradesh'
  },
  {
    id: '14',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    category: 'Insurance',
    status: 'Registration Open',
    description: 'Comprehensive crop insurance for farmers against natural calamities and crop failure.',
    benefits: 'Coverage up to ₹2 lakh per hectare',
    eligibility: 'All farmers with notified crops',
    deadline: '2024-06-30',
    location: 'All India'
  },
  {
    id: '15',
    title: 'Subhasra Krishi Sinchayee Scheme',
    category: 'Water Management',
    status: 'Active',
    description: 'Sprinkler and drip irrigation subsidy for water conservation.',
    benefits: 'Up to 60% subsidy on equipment',
    eligibility: 'Marginal and small farmers',
    deadline: '2024-09-30',
    location: 'Multiple States'
  },
  {
    id: '16',
    title: 'Integrated Pest Management (IPM)',
    category: 'Soil Management',
    status: 'Active',
    description: 'Training and support for eco-friendly pest management practices.',
    benefits: 'Free training & input subsidies',
    eligibility: 'All farmers',
    deadline: '2024-12-31',
    location: 'All India'
  },
  {
    id: '17',
    title: 'Horticulture Mission for Northeast',
    category: 'Organic Farming',
    status: 'Active',
    description: 'Development of horticulture sector in Northeast states.',
    benefits: 'Subsidized seeds, training & marketing support',
    eligibility: 'Farmers in Northeast India',
    deadline: '2024-12-31',
    location: 'Northeast States'
  },
  {
    id: '18',
    title: 'Livestock Insurance Scheme',
    category: 'Insurance',
    status: 'Registration Open',
    description: 'Insurance coverage for livestock protecting against death and disease.',
    benefits: 'Up to ₹30,000 per animal coverage',
    eligibility: 'All livestock farmers',
    deadline: '2024-12-31',
    location: 'All India'
  },
  {
    id: '19',
    title: 'National e-Governance Plan for Agriculture',
    category: 'Credit',
    status: 'Active',
    description: 'Digital agriculture services and information dissemination platform.',
    benefits: 'Free access to e-platforms and digital services',
    eligibility: 'All farmers',
    deadline: '2024-12-31',
    location: 'All India'
  },
  {
    id: '20',
    title: 'Dairy Entrepreneurship Development Scheme',
    category: 'Credit',
    status: 'Active',
    description: 'Financial assistance for dairy farming businesses and dairy plant setup.',
    benefits: 'Loans up to ₹25 lakh at subsidized rates',
    eligibility: 'Entrepreneurs interested in dairy farming',
    deadline: '2024-12-31',
    location: 'All India'
  }
];

export default function Schemes() {
  const { t, getVoiceLocale } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const ttsService = new SpeechSynthesisService();

  const filteredSchemes = SCHEMES_DATA.filter(scheme => {
    const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleVoicePlay = (scheme: typeof SCHEMES_DATA[0]) => {
    const text = `${scheme.title}. ${scheme.description}. ${t('benefits')}: ${scheme.benefits}. ${t('eligibility')}: ${scheme.eligibility}.`;
    ttsService.speak(text, getVoiceLocale());
    toast({ title: t('playing_scheme_details') });
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* Weather Alert */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Heavy rain expected tomorrow. Prepare for harvesting.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-foreground">Government Schemes</h1>
          <div className="flex gap-2 flex-1 max-w-md">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search_schemes')}
              className="flex-1"
            />
            <Button size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Schemes Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSchemes.map((scheme, index) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card via-card to-primary/5 border-2">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-foreground">{scheme.title}</h3>
                    <Badge variant="outline" className="text-xs border-primary/30">
                      {scheme.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleVoicePlay(scheme)}
                      className="h-9 w-9 hover:bg-success/10"
                    >
                      <Volume2 className="h-4 w-4 text-success" />
                    </Button>
                    <Badge className={`${getStatusColor(scheme.status)} font-semibold`}>
                      {scheme.status}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {scheme.description}
                </p>

                {/* Benefits */}
                <div className="mb-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <p className="text-xs font-semibold text-warning mb-1 uppercase tracking-wide">Benefits</p>
                  <p className="text-base font-bold text-warning">{scheme.benefits}</p>
                </div>

                {/* Eligibility */}
                <div className="mb-5 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Eligibility</p>
                  <p className="text-sm font-medium">{scheme.eligibility}</p>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Deadline: {scheme.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{scheme.location}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-success hover:bg-success/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => toast({ title: "Application opening soon!" })}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredSchemes.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">{t('schemes_no_results')}</p>
          </Card>
        )}
      </main>
    </div>
  );
}
