import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Leaf, TrendingUp, FileText, ArrowRight, LogIn, UserPlus, ShoppingCart } from 'lucide-react';
import { getProfile } from '@/lib/storage';
import { useLanguage } from '@/lib/i18n';

export default function Landing() {
  const navigate = useNavigate();
  const hasProfile = !!getProfile();
  const { t } = useLanguage();

  const features = [
    {
      icon: Leaf,
      title: 'AI Crop Diagnosis',
      description: 'Instant disease detection with treatment advice'
    },
    {
      icon: TrendingUp,
      title: 'Live Market Prices',
      description: 'Real-time crop prices with smart recommendations'
    },
    {
      icon: FileText,
      title: 'Government Schemes',
      description: 'Find subsidies & benefits instantly'
    },
    {
      icon: ShoppingCart,
      title: 'Kisan+ Marketplace',
      description: 'List your produce to sell, manage your listings (add/delete), or purchase from other farmers.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 text-6xl opacity-30"
        >
          🌾
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-40 right-20 text-5xl opacity-30"
        >
          🌻
        </motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-40 left-1/4 text-7xl opacity-30"
        >
          🌿
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 max-w-4xl mx-auto"
        >
          {/* Logo & floating mic animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
            className="relative inline-block"
          >
            <div className="relative">
              {/* Floating mic with pulse */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-24 h-24 md:w-32 md:h-32 bg-primary rounded-full flex items-center justify-center shadow-2xl mx-auto"
              >
                <Mic className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </motion.div>
              
              {/* Pulse rings */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute inset-0 border-4 border-primary rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.5
                }}
                className="absolute inset-0 border-4 border-primary rounded-full"
              />
            </div>
          </motion.div>

          {/* Hero text */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-5xl md:text-7xl font-bold text-foreground"
            >
              {t('hero_welcome').split('Kisan+')[0]} <span className="text-primary">Kisan+</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
            >
              {t('smart_farming_partner')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-lg text-muted-foreground max-w-xl mx-auto"
            >
              {t('hero_description')}
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              {t('get_started')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-6 rounded-2xl hover:bg-primary/10 hover:border-primary"
            >
              <LogIn className="mr-2 h-5 w-5" />
              {t('login')}
            </Button>
          </motion.div>

          {/* Features grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-16"
            id="how-it-works"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + i * 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-border"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* How it works steps */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="pt-20 space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Simple. Fast. Voice-First.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[t('hero_step_one'), t('hero_step_two'), t('hero_step_three')].map((step, i) => (
                <div key={i} className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                    {i + 1}
                  </div>
                  <p className="text-lg font-semibold">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="pt-12 flex gap-4 justify-center flex-wrap"
          >
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="text-lg px-12 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-secondary"
            >
              Start Using Kisan+ Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="text-lg px-12 py-6 rounded-2xl hover:bg-primary/10 hover:border-primary transition-all hover:scale-105"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Already Have Account
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
