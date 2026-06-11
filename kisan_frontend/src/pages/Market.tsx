import { useMemo, useState } from 'react';
import { Volume2, Filter, RefreshCw, TrendingUp, TrendingDown, Cloud, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SpeechSynthesisService } from '@/lib/speech';
import { useLanguage } from '@/lib/i18n';

const PRICE_ALERTS = [
  {
    crop: 'Rice',
    message: 'Price increased by ₹100/quintal in last 3 days',
    trend: 'up',
    percentage: '+3.2%'
  },
  {
    crop: 'Wheat',
    message: 'Expected price rise next week due to procurement',
    trend: 'up',
    percentage: '+2.3%'
  },
  {
    crop: 'Cotton',
    message: 'High demand from textile industry',
    trend: 'up',
    percentage: '+5.6%'
  }
];

const MANDI_PRICES = [
  {
    crop: 'Rice',
    variety: 'Basmati',
    market: 'Delhi Mandi',
    currentPrice: 3200,
    previousPrice: 3100,
    change: 3.2
  },
  {
    crop: 'Wheat',
    variety: 'HD-2967',
    market: 'Haryana Mandi',
    currentPrice: 2150,
    previousPrice: 2200,
    change: -2.3
  },
  {
    crop: 'Cotton',
    variety: 'Shankar-6',
    market: 'Gujarat Mandi',
    currentPrice: 5800,
    previousPrice: 5600,
    change: 3.6
  },
  {
    crop: 'Sugarcane',
    variety: 'Co-238',
    market: 'UP Mandi',
    currentPrice: 350,
    previousPrice: 340,
    change: 2.9
  },
  {
    crop: 'Soybean',
    variety: 'JS-335',
    market: 'MP Mandi',
    currentPrice: 4200,
    previousPrice: 4300,
    change: -2.3
  }
];

const MARKET_ITEMS = [
  {
    id: 'market-1',
    title: 'Carrot',
    subtitle: 'Fresh farm carrots',
    category: 'Vegetables',
    price: '₹12/kg',
    location: 'Chennai',
    description: 'Fresh, crisp carrots grown by local farmers.',
    tag: 'Vegetables',
  },
  {
    id: 'market-2',
    title: 'Apple',
    subtitle: 'Premium red apples',
    category: 'Fruits',
    price: '₹100/kg',
    location: 'Chennai',
    description: 'Crisp apples with natural sweetness and freshness.',
    tag: 'Fruits',
  },
  {
    id: 'market-3',
    title: 'Organic Alphonso Mangoes',
    subtitle: 'Grade A Alphonso',
    category: 'Fruits',
    price: '₹450/dozen',
    location: 'Ratnagiri, Maharashtra',
    description: 'Sweet, juicy Alphonso mangoes direct from farms.',
    tag: 'Fruits',
  },
  {
    id: 'market-4',
    title: 'Fresh Farm Red Tomatoes',
    subtitle: 'Pesticide-free tomatoes',
    category: 'Vegetables',
    price: '₹40/kg',
    location: 'Nashik, Maharashtra',
    description: 'Rich, red tomatoes perfect for cooking and salads.',
    tag: 'Vegetables',
  },
  {
    id: 'market-5',
    title: 'Premium Basmati Rice',
    subtitle: 'Aged long grain rice',
    category: 'Grains',
    price: '₹110/kg',
    location: 'Karnal, Haryana',
    description: 'Aromatic Basmati rice aged for premium flavor.',
    tag: 'Grains',
  },
  {
    id: 'market-6',
    title: 'Fresh Green Spiced Chillies',
    subtitle: 'Farm-fresh chillies',
    category: 'Vegetables',
    price: '₹60/kg',
    location: 'Guntur, Andhra Pradesh',
    description: 'Hot green chillies picked fresh from the field.',
    tag: 'Vegetables',
  },
  {
    id: 'market-7',
    title: 'Organic Green Cardamom (Elaichi)',
    subtitle: 'Aromatic spice pods',
    category: 'Spices',
    price: '₹1800/kg',
    location: 'Idukki, Kerala',
    description: 'Premium cardamom harvested and sorted by hand.',
    tag: 'Spices',
  },
  {
    id: 'market-8',
    title: 'Milk Powder',
    subtitle: 'High-protein dairy',
    category: 'Dairy',
    price: '₹350/kg',
    location: 'Tamil Nadu',
    description: 'Pure dairy nutrition sourced from local farms.',
    tag: 'Dairy',
  },
];

export default function Market() {
  const { language, getVoiceLocale } = useLanguage();
  const [lastUpdated] = useState(new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }));
  const [searchQuery, setSearchQuery] = useState('');
  const [trendFilter, setTrendFilter] = useState('all');
  const [showTopOnly, setShowTopOnly] = useState(false);

  const voiceLocale = getVoiceLocale();
  const ttsService = useMemo(() => new SpeechSynthesisService(), []);

  const filteredPrices = MANDI_PRICES.filter(price => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      price.crop.toLowerCase().includes(search) ||
      price.variety.toLowerCase().includes(search) ||
      price.market.toLowerCase().includes(search);

    const matchesTrend = trendFilter === 'all' ||
      (trendFilter === 'rising' && price.change > 0) ||
      (trendFilter === 'falling' && price.change < 0) ||
      (trendFilter === 'stable' && price.change === 0);

    return matchesSearch && matchesTrend;
  }).slice(0, showTopOnly ? 3 : undefined);

  const filteredItems = MARKET_ITEMS.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    );
  });

  const handleListen = () => {
    const topAlerts = PRICE_ALERTS.map((alert) => `${alert.crop}: ${alert.message}`).join('. ');
    const speechText = `Market updates. ${topAlerts}. Last updated ${lastUpdated}.`;
    ttsService.speak(speechText, voiceLocale);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t('marketplace')}</p>
                <h1 className="text-3xl font-bold text-foreground mt-2">{t('market_intro_title')}</h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                  {t('market_intro_text')}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={handleListen}>
                  <Volume2 className="h-4 w-4 mr-2" />
                  {t('read_aloud')}
                </Button>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('refresh')}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-card border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('marketplace_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Select value={trendFilter} onValueChange={setTrendFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('all_trends')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('trend_all')}</SelectItem>
                  <SelectItem value="rising">{t('trend_rising')}</SelectItem>
                  <SelectItem value="falling">{t('trend_falling')}</SelectItem>
                  <SelectItem value="stable">{t('trend_stable')}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showTopOnly ? 'default' : 'outline'}
                onClick={() => setShowTopOnly(!showTopOnly)}
                className="w-full sm:w-auto"
              >
                Top Crops
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-card via-card to-success/5">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="text-xl font-bold">Market Insights</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {PRICE_ALERTS.slice(0, showTopOnly ? 2 : PRICE_ALERTS.length).map((alert) => (
                <div key={alert.crop} className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{alert.crop}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    </div>
                    <Badge className="bg-success/10 text-success">{alert.percentage}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {t('market_prices_title')}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{t('market_prices_last_updated')} {lastUpdated}</p>
              </div>
            </div>

            <div className="sm:hidden space-y-3">
              {filteredPrices.map((price, index) => (
                <motion.div
                  key={price.crop + price.variety}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold">{price.crop}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{price.market}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${price.change > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {price.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span className="text-xs font-bold">{price.change > 0 ? '+' : ''}{price.change}%</span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="text-lg font-bold">₹{price.currentPrice.toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">/q</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                        <p className="text-sm font-semibold">₹{price.previousPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{price.change > 0 ? 'Good time to sell' : 'Wait for better rates.'}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[80px]">{t('crop')}</TableHead>
                    <TableHead className="min-w-[100px]">{t('variety')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('market')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('current_price')}</TableHead>
                    <TableHead className="min-w-[110px]">{t('previous')}</TableHead>
                    <TableHead className="min-w-[100px]">{t('change')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrices.map((price, index) => (
                    <motion.tr
                      key={price.crop + price.variety}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="hover:bg-muted/30 transition-all duration-200"
                    >
                      <TableCell className="font-bold text-sm sm:text-base">{price.crop}</TableCell>
                      <TableCell className="text-muted-foreground font-medium text-xs sm:text-sm">{price.variety}</TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm">{price.market}</TableCell>
                      <TableCell className="font-bold text-base sm:text-lg">₹{price.currentPrice.toLocaleString()}<span className="text-xs text-muted-foreground font-normal"> /q</span></TableCell>
                      <TableCell className="text-muted-foreground font-medium text-xs sm:text-sm">₹{price.previousPrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className={`${price.change > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'} flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full`}>
                          {price.change > 0 ? <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />}
                          <span className="font-bold text-xs sm:text-sm whitespace-nowrap">{price.change > 0 ? '+' : ''}{price.change}%</span>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">{item.tag}</span>
                    <span className="text-xs text-muted-foreground">{item.location}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xl font-bold text-emerald-600">{item.price}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => ttsService.speak(`${item.title}, ${item.description}. Price ${item.price}. Location ${item.location}.`, voiceLocale)}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Read Aloud
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
