import { useState, useEffect } from 'react';
import { Volume2, Filter, MapPin, ShoppingCart, Search, Sparkles, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n';
import { SpeechSynthesisService } from '@/lib/speech';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { getProfile } from '@/lib/storage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PRODUCT_CATEGORIES = [
  { name: 'All Categories', emoji: '🌾', id: 'all' },
  { name: 'Fruits', emoji: '🍎', id: 'fruits' },
  { name: 'Vegetables', emoji: '🥕', id: 'vegetables' },
  { name: 'Grains', emoji: '🌾', id: 'grains' },
  { name: 'Dairy', emoji: '🥛', id: 'dairy' },
  { name: 'Spices', emoji: '🌶️', id: 'spices' },
  { name: 'Other', emoji: '📦', id: 'other' },
];

const UNIT_OPTIONS = [
  { label: 'per Kilogram (/kg)', value: '/kg' },
  { label: 'per Quintal (/q)', value: '/q' },
  { label: 'per Dozen (/dozen)', value: '/dozen' },
  { label: 'per Liter (/liter)', value: '/liter' },
  { label: 'per Glass (/glass)', value: '/glass' },
  { label: 'per Piece (/piece)', value: '/piece' },
];

export default function Marketplace() {
  const { t, language, getVoiceLocale } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Purchase States
  const [buyProduct, setBuyProduct] = useState<any | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [buyerContactPhone, setBuyerContactPhone] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [isConfirmingBuy, setIsConfirmingBuy] = useState(false);

  // Form State
  const profile = getProfile();
  const defaultLocation = profile
    ? [profile.village, profile.district, profile.state].filter(Boolean).join(', ')
    : '';

  const [formValues, setFormValues] = useState({
    title: '',
    category: 'Vegetables',
    price: '',
    unit: '/kg',
    location: defaultLocation || 'Chennai',
    description: '',
  });

  const ttsService = new SpeechSynthesisService();
  const voiceLocale = getVoiceLocale();

  const handleOpenBuyDialog = (product: any) => {
    setBuyProduct(product);
    setBuyQuantity(1);
    setBuyerContactPhone(profile?.phone || '');
    setBuyerNotes(defaultLocation || '');
  };

  const handleConfirmBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerContactPhone) {
      toast({ title: 'Please enter a contact phone number', variant: 'destructive' });
      return;
    }
    
    try {
      setIsConfirmingBuy(true);
      // Simulate backend latency
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      toast({
        title: 'Order Request Sent! 🎉',
        description: `Successfully requested ${buyQuantity} ${buyProduct.unit.replace('/', '')} of ${buyProduct.title}. Seller will call you soon.`,
      });
      
      ttsService.speak(`Order confirmed for ${buyQuantity} ${buyProduct.unit.replace('/', '')} of ${buyProduct.title}.`, voiceLocale);
      setBuyProduct(null);
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to complete order request', variant: 'destructive' });
    } finally {
      setIsConfirmingBuy(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      await api.delete(`/market/products/${productId}`);
      toast({ title: 'Product listing deleted successfully!' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to delete product', variant: 'destructive' });
    }
  };



  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/market/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to load products', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.title || !formValues.price || !formValues.location) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/market/products', {
        title: formValues.title,
        category: formValues.category,
        price: parseFloat(formValues.price),
        unit: formValues.unit,
        location: formValues.location,
        description: formValues.description,
      });

      toast({ title: 'Product listing added successfully!' });
      setIsAddDialogOpen(false);
      
      // Reset form
      setFormValues({
        title: '',
        category: 'Vegetables',
        price: '',
        unit: '/kg',
        location: defaultLocation || 'Chennai',
        description: '',
      });

      // Refresh products list
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to add product listing', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleReadAloud = () => {
    if (filteredProducts.length === 0) return;
    const text = `Marketplace. Browse fresh farm products directly from sellers. ${filteredProducts.slice(0, 3).map(p => `${p.title} at rupees ${p.price} per ${p.unit.replace('/', '')}`).join('. ')}.`;
    ttsService.speak(text, voiceLocale);
  };

  const handleProductClick = (product: any) => {
    const text = `${product.title}. Price: rupees ${product.price} ${product.unit}. Location: ${product.location}. ${product.description || ''}`;
    ttsService.speak(text, voiceLocale);
    toast({
      title: 'Product Details',
      description: `${product.title} - ₹${product.price}${product.unit}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 w-full">
      <main className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {t('marketplace')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {t('page_intro')}
              </p>
            </div>
            
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 py-6 rounded-2xl shadow-lg shadow-emerald-600/10"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </Button>
          </div>

          {/* Info Banner */}
          <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium leading-relaxed">
              💡 {t('quick_tip')}: {t('marketplace_voice_button')}!
            </p>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder={t('marketplace_search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
          <Button
            onClick={handleReadAloud}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Volume2 className="w-4 h-4" />
            {t('read_aloud')}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            {t('filter')}
          </Button>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t('marketplace_categories')}
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold transition-all flex-shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20 scale-105'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-lg">{category.emoji}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading products...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {/* Dashed "+ Add Product" card matching original card structure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onClick={() => setIsAddDialogOpen(true)}
              className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-center items-center p-8 text-center min-h-[300px]"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center border border-emerald-100 dark:border-emerald-900 group-hover:scale-110 transition-transform duration-300 mb-4 text-emerald-600 dark:text-emerald-400">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-lg">
                Add Your Product
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-[180px] leading-relaxed">
                List your crops and farm produce in the marketplace
              </p>
            </motion.div>

            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => handleProductClick(product)}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-800/80 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Product Image */}
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 overflow-hidden relative flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-6xl opacity-50 select-none">
                      {product.emoji || (PRODUCT_CATEGORIES.find(c => c.name.toLowerCase() === product.category.toLowerCase())?.emoji || '📦')}
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-xs font-bold text-emerald-800 dark:text-emerald-400 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
                      {product.emoji || (PRODUCT_CATEGORIES.find(c => c.name.toLowerCase() === product.category.toLowerCase())?.emoji || '📦')} {product.category}
                    </span>
                  </div>
                  {profile && product.user_id === profile.id && (
                    <div className="absolute top-3 right-3 z-10">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-8 h-8 rounded-full hover:scale-110 active:scale-95 transition-all shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-lg">
                      {product.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed min-h-[40px]">
                      {product.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Price and Location */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xl">
                        ₹{product.price}
                        <span className="text-xs font-semibold text-slate-400">{product.unit}</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-400 max-w-[120px] truncate">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-300" />
                        {product.location}
                      </span>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBuyDialog(product);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-xl font-bold hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all active:scale-95 text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {t('buy_now')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {t('schemes_no_results')}
            </p>
          </div>
        )}
      </main>

      {/* Add Product Dialog Modal */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-2 dark:border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🌱</span> Add Product to Marketplace
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
              List your agricultural produce directly for buyers to purchase.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddProduct} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-bold text-slate-700 dark:text-slate-300">Product Title *</Label>
              <Input
                id="title"
                required
                value={formValues.title}
                onChange={(e) => setFormValues(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Fresh Organic Potatoes"
                className="py-5 text-sm bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm font-bold text-slate-700 dark:text-slate-300">Category *</Label>
                <Select
                  value={formValues.category}
                  onValueChange={(val) => setFormValues(prev => ({ ...prev, category: val }))}
                >
                  <SelectTrigger className="py-5 text-sm bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.filter(c => c.id !== 'all').map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.emoji} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-sm font-bold text-slate-700 dark:text-slate-300">Unit *</Label>
                <Select
                  value={formValues.unit}
                  onValueChange={(val) => setFormValues(prev => ({ ...prev, unit: val }))}
                >
                  <SelectTrigger className="py-5 text-sm bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-sm font-bold text-slate-700 dark:text-slate-300">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  required
                  min="1"
                  value={formValues.price}
                  onChange={(e) => setFormValues(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Price in rupees"
                  className="py-5 text-sm bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-sm font-bold text-slate-700 dark:text-slate-300">Location *</Label>
                <Input
                  id="location"
                  required
                  value={formValues.location}
                  onChange={(e) => setFormValues(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Nashik, Maharashtra"
                  className="py-5 text-sm bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Details about quality, harvest date, availability, etc."
                className="min-h-[80px] bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>

            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="py-5 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-5 font-extrabold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                  </>
                ) : (
                  'List Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Buy Product Dialog Modal */}
      <Dialog open={!!buyProduct} onOpenChange={(open) => !open && setBuyProduct(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-2 dark:border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🛒</span> Buy Farm Produce
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
              Confirm your quantity and contact information to notify the farmer.
            </DialogDescription>
          </DialogHeader>

          {buyProduct && (
            <form onSubmit={handleConfirmBuy} className="space-y-4 py-3">
              {/* Product mini card */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4 items-center">
                <div className="text-4xl select-none bg-white dark:bg-slate-900 w-14 h-14 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                  {buyProduct.emoji || (PRODUCT_CATEGORIES.find(c => c.name.toLowerCase() === buyProduct.category.toLowerCase())?.emoji || '📦')}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 truncate text-base">
                    {buyProduct.title}
                  </h4>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                    ₹{buyProduct.price} {buyProduct.unit}
                  </p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-300" />
                    {buyProduct.location}
                  </p>
                </div>
              </div>

              {/* Quantity selector */}
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Quantity ({buyProduct.unit.replace('/', '')})
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Adjust quantity needed</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 rounded-full font-bold border-slate-200 dark:border-slate-800"
                    onClick={() => setBuyQuantity(q => Math.max(1, q - 1))}
                  >
                    -
                  </Button>
                  <span className="font-extrabold text-lg w-8 text-center">{buyQuantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 rounded-full font-bold border-slate-200 dark:border-slate-800"
                    onClick={() => setBuyQuantity(q => q + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="buyer-phone" className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Contact Phone *</Label>
                <Input
                  id="buyer-phone"
                  required
                  value={buyerContactPhone}
                  onChange={(e) => setBuyerContactPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  placeholder="10 digit mobile"
                  className="py-5 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Address / Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="buyer-notes" className="text-sm font-bold text-slate-700 dark:text-slate-300">Delivery Address / Special Instructions</Label>
                <Textarea
                  id="buyer-notes"
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  placeholder="Enter your delivery location or specify special requests"
                  className="min-h-[70px] bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Summary of Price */}
              <div className="flex justify-between items-center py-3 px-1 border-t mt-4">
                <span className="text-sm font-bold text-slate-500">Total Price</span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{(buyProduct.price * buyQuantity).toLocaleString()}
                </span>
              </div>

              <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBuyProduct(null)}
                  className="py-5 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isConfirmingBuy}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-5 font-extrabold flex-1"
                >
                  {isConfirmingBuy ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...
                    </>
                  ) : (
                    'Confirm Purchase Request'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
