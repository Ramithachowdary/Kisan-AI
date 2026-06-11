import { useNavigate } from 'react-router-dom';
import { Camera, TrendingUp, FileText, HelpCircle, User, Cloud, AlertTriangle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProfile } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

export default function Dashboard() {
  const navigate = useNavigate();
  const profile = getProfile();
  const { t } = useLanguage();

  const features = [
    {
      icon: Camera,
      title: t('ai_crop_diagnosis'),
      description: t('ai_crop_diagnosis_desc'),
      color: 'bg-primary',
      route: '/diagnosis'
    },
    {
      icon: TrendingUp,
      title: t('live_market_prices'),
      description: t('live_market_prices_desc'),
      color: 'bg-secondary',
      route: '/market'
    },
    {
      icon: FileText,
      title: t('government_schemes'),
      description: t('government_schemes_desc'),
      color: 'bg-brown',
      route: '/schemes'
    },
    {
      icon: HelpCircle,
      title: t('help_history'),
      description: t('help_history_desc'),
      color: 'bg-accent',
      route: '/help'
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">{t('dashboard')}</h1>
            <p className="text-muted-foreground">{t('welcome_back').replace('{{name}}', profile?.name || t('farmer'))}</p>
          </div>

          {/* Welcome message with animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-2 mb-2 mt-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('how_can_i_help')}
            </h2>
            <p className="text-muted-foreground">
              {t('quick_tip')}
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 touch-target border-2 border-transparent hover:border-primary/20"
                  onClick={() => navigate(feature.route)}
                >
                  <div className="flex items-start gap-4">
                    <motion.div 
                      className={`${feature.color} p-3 rounded-xl text-white shadow-lg`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-6 w-6" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick tips with animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 max-w-2xl mx-auto bg-gradient-to-r from-accent/10 to-secondary/10 border-2 border-accent/20">
              <div className="flex items-start gap-3">
                <span className="text-3xl">💡</span>
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Quick Tip</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the floating mic button to quickly ask about crop prices, get diagnosis,
                    or find government schemes. Just speak naturally in your language!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
