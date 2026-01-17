'use client'

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Droplet, Utensils, Trash2, RefreshCw, BarChart3, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// TypeScript interfaces
interface FoodLog {
  id: string;
  created_at: string;
  food_name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  salt: number | null;
  omega_3: number | null;
  omega_6: number | null;
  vitamin_a: number | null;
  vitamin_b1: number | null;
  vitamin_b2: number | null;
  vitamin_b3: number | null;
  vitamin_b5: number | null;
  vitamin_b6: number | null;
  vitamin_b12: number | null;
  folate: number | null;
  biotin: number | null;
  choline: number | null;
  vitamin_c: number | null;
  vitamin_d: number | null;
  vitamin_e: number | null;
  vitamin_k: number | null;
  calcium: number | null;
  phosphorus: number | null;
  magnesium: number | null;
  iron: number | null;
  iodine: number | null;
  zinc: number | null;
  selenium: number | null;
  manganese: number | null;
  fluoride: number | null;
  chromium: number | null;
  potassium: number | null;
  chloride: number | null;
  copper: number | null;
  meal_time: string;
}

interface WaterLog {
  id: string;
  created_at: string;
  amount_ml: number;
}

interface FoodFormData {
  foodName: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  mealTime: string;
  fiber: string;
  sugar: string;
  sodium: string;
  salt: string;
  omega_3: string;
  omega_6: string;
  vitamin_a: string;
  vitamin_b1: string;
  vitamin_b2: string;
  vitamin_b3: string;
  vitamin_b5: string;
  vitamin_b6: string;
  vitamin_b12: string;
  folate: string;
  biotin: string;
  choline: string;
  vitamin_c: string;
  vitamin_d: string;
  vitamin_e: string;
  vitamin_k: string;
  calcium: string;
  phosphorus: string;
  magnesium: string;
  iron: string;
  iodine: string;
  zinc: string;
  selenium: string;
  manganese: string;
  fluoride: string;
  chromium: string;
  potassium: string;
  chloride: string;
  copper: string;
}

// Target nutrisi harian
const DAILY_TARGETS = {
  calories: 1200,
  protein: 65,
  fat: 65,
  carbs: 360,
  fiber: 32,
  sugar: 50,
  salt: 5,
  omega_3: 1.1,
  omega_6: 11,
  vitamin_a: 600,
  vitamin_d: 15,
  vitamin_e: 15,
  vitamin_k: 55,
  vitamin_b1: 1.1,
  vitamin_b2: 1.1,
  vitamin_b3: 14,
  vitamin_b5: 5.0,
  vitamin_b6: 1.3,
  folate: 400,
  vitamin_b12: 4.0,
  biotin: 30,
  choline: 425,
  vitamin_c: 75,
  calcium: 1000,
  phosphorus: 700,
  magnesium: 330,
  iron: 18,
  iodine: 150,
  zinc: 8,
  selenium: 24,
  manganese: 1.8,
  fluoride: 3.0,
  chromium: 30,
  potassium: 4700,
  sodium: 1500,
  chloride: 2250,
  copper: 9,
  water: 2000, // ml
};

const FoodTrackerApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [detailedMode, setDetailedMode] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const [foodForm, setFoodForm] = useState<FoodFormData>({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    mealTime: 'breakfast',
    // Mikronutrien
    fiber: '', sugar: '', sodium: '', salt: '', omega_3: '', omega_6: '',
    vitamin_a: '', vitamin_b1: '', vitamin_b2: '', vitamin_b3: '', vitamin_b5: '',
    vitamin_b6: '', vitamin_b12: '', folate: '', biotin: '', choline: '',
    vitamin_c: '', vitamin_d: '', vitamin_e: '', vitamin_k: '',
    calcium: '', phosphorus: '', magnesium: '', iron: '', iodine: '',
    zinc: '', selenium: '', manganese: '', fluoride: '', chromium: '',
    potassium: '', chloride: '', copper: '',
  });

  useEffect(() => {
    document.title = 'Food Tracker - Track Nutrisi Harian';
  }, []);

  useEffect(() => {
    loadTodayData();
  }, []);

  useEffect(() => {
    if (!reminderEnabled) return;
    const interval = setInterval(() => {
      if (Notification.permission === 'granted') {
        new Notification('💧 Waktunya Minum Air!', {
          body: 'Jangan lupa minum air putih ya!',
        });
      } else {
        alert('💧 Reminder: Waktunya minum air putih!');
      }
    }, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [reminderEnabled]);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: foodData, error: foodError } = await supabase
        .from('food_logs')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });
      
      if (foodError) throw foodError;
      
      const { data: waterData, error: waterError } = await supabase
        .from('water_logs')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });
      
      if (waterError) throw waterError;
      
      setFoodLogs(foodData || []);
      setWaterLogs(waterData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const enableReminder = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setReminderEnabled(true);
        alert('✅ Reminder aktif! Kamu akan diingatkan setiap 2 jam');
      }
    } else {
      setReminderEnabled(true);
      alert('✅ Reminder aktif!');
    }
  };

  const handleAddFood = async () => {
    if (!foodForm.foodName.trim()) {
      alert('Nama makanan harus diisi!');
      return;
    }

    try {
      const insertData: Partial<FoodLog> = {
        food_name: foodForm.foodName,
        calories: parseFloat(foodForm.calories) || null,
        protein: parseFloat(foodForm.protein) || null,
        carbs: parseFloat(foodForm.carbs) || null,
        fat: parseFloat(foodForm.fat) || null,
        meal_time: foodForm.mealTime,
      };

      // Tambah mikronutrien jika detailed mode
      if (detailedMode) {
        const micronutrients = ['fiber', 'sugar', 'sodium', 'salt', 'omega_3', 'omega_6',
          'vitamin_a', 'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b5',
          'vitamin_b6', 'vitamin_b12', 'folate', 'biotin', 'choline',
          'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
          'calcium', 'phosphorus', 'magnesium', 'iron', 'iodine',
          'zinc', 'selenium', 'manganese', 'fluoride', 'chromium',
          'potassium', 'chloride', 'copper'] as const;
        
        micronutrients.forEach(nutrient => {
          const value = foodForm[nutrient as keyof FoodFormData];
          (insertData as Record<string, number | null | string>)[nutrient] = parseFloat(value as string) || null;
        });
      }

      const { error } = await supabase
        .from('food_logs')
        .insert([insertData])
        .select();

      if (error) throw error;

      await loadTodayData();
      
      // Reset form
      const resetForm: FoodFormData = {
        foodName: '', calories: '', protein: '', carbs: '', fat: '', mealTime: 'breakfast',
        fiber: '', sugar: '', sodium: '', salt: '', omega_3: '', omega_6: '',
        vitamin_a: '', vitamin_b1: '', vitamin_b2: '', vitamin_b3: '', vitamin_b5: '',
        vitamin_b6: '', vitamin_b12: '', folate: '', biotin: '', choline: '',
        vitamin_c: '', vitamin_d: '', vitamin_e: '', vitamin_k: '',
        calcium: '', phosphorus: '', magnesium: '', iron: '', iodine: '',
        zinc: '', selenium: '', manganese: '', fluoride: '', chromium: '',
        potassium: '', chloride: '', copper: '',
      };
      setFoodForm(resetForm);
      setShowFoodForm(false);
      
      alert('✅ Makanan berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding food:', error);
      alert('Error: ' + (error as Error).message);
    }
  };

  const addWaterLog = async (amount: number) => {
    try {
      const { error } = await supabase
        .from('water_logs')
        .insert([{ amount_ml: amount }])
        .select();
      if (error) throw error;
      await loadTodayData();
    } catch (error) {
      console.error('Error adding water:', error);
      alert('Error: ' + (error as Error).message);
    }
  };

  const deleteFoodLog = async (id: string) => {
    if (!confirm('Hapus data makanan ini?')) return;
    try {
      const { error } = await supabase.from('food_logs').delete().eq('id', id);
      if (error) throw error;
      await loadTodayData();
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Error: ' + (error as Error).message);
    }
  };

  const deleteWaterLog = async (id: string) => {
    if (!confirm('Hapus data air ini?')) return;
    try {
      const { error } = await supabase.from('water_logs').delete().eq('id', id);
      if (error) throw error;
      await loadTodayData();
    } catch (error) {
      console.error('Error deleting water:', error);
      alert('Error: ' + (error as Error).message);
    }
  };

  // Calculate totals
  const calculateTotal = (field: keyof FoodLog) => {
    return foodLogs.reduce((sum, log) => sum + (parseFloat(String(log[field])) || 0), 0);
  };

  const totals = {
    calories: calculateTotal('calories'),
    protein: calculateTotal('protein'),
    carbs: calculateTotal('carbs'),
    fat: calculateTotal('fat'),
    fiber: calculateTotal('fiber'),
    sugar: calculateTotal('sugar'),
    sodium: calculateTotal('sodium'),
    salt: calculateTotal('salt'),
    omega_3: calculateTotal('omega_3'),
    omega_6: calculateTotal('omega_6'),
    vitamin_a: calculateTotal('vitamin_a'),
    vitamin_b1: calculateTotal('vitamin_b1'),
    vitamin_b2: calculateTotal('vitamin_b2'),
    vitamin_b3: calculateTotal('vitamin_b3'),
    vitamin_b5: calculateTotal('vitamin_b5'),
    vitamin_b6: calculateTotal('vitamin_b6'),
    vitamin_b12: calculateTotal('vitamin_b12'),
    folate: calculateTotal('folate'),
    biotin: calculateTotal('biotin'),
    choline: calculateTotal('choline'),
    vitamin_c: calculateTotal('vitamin_c'),
    vitamin_d: calculateTotal('vitamin_d'),
    vitamin_e: calculateTotal('vitamin_e'),
    vitamin_k: calculateTotal('vitamin_k'),
    calcium: calculateTotal('calcium'),
    phosphorus: calculateTotal('phosphorus'),
    magnesium: calculateTotal('magnesium'),
    iron: calculateTotal('iron'),
    iodine: calculateTotal('iodine'),
    zinc: calculateTotal('zinc'),
    selenium: calculateTotal('selenium'),
    manganese: calculateTotal('manganese'),
    fluoride: calculateTotal('fluoride'),
    chromium: calculateTotal('chromium'),
    potassium: calculateTotal('potassium'),
    chloride: calculateTotal('chloride'),
    copper: calculateTotal('copper'),
    water: waterLogs.reduce((sum, log) => sum + log.amount_ml, 0),
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    if (percentage < 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage > 100) return { color: 'text-red-600', message: `⚠️ Over ${(current - target).toFixed(1)}!` };
    if (percentage < 70) return { color: 'text-blue-600', message: `Kurang ${(target - current).toFixed(1)}` };
    return { color: 'text-green-600', message: '✓ Baik' };
  };

  const ProgressBar = ({ label, current, target, unit }: { label: string; current: number; target: number; unit: string }) => {
    const percentage = Math.min((current / target) * 100, 100);
    const status = getProgressStatus(current, target);
    
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className={`text-sm font-semibold ${status.color}`}>
            {current.toFixed(1)}/{target} {unit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className={`text-xs mt-1 ${status.color}`}>{status.message}</div>
      </div>
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getMealEmoji = (meal: string) => {
    const emojis: { [key: string]: string } = {
      breakfast: '🌅',
      lunch: '🌞',
      dinner: '🌙',
      snack: '🍪'
    };
    return emojis[meal] || '🍽️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-green-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex">
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-green-50 shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-green-100 bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Utensils className="text-white" size={24} />
              Food Tracker
            </h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white hover:bg-white/20 rounded-lg p-1">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => { setCurrentPage('dashboard'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPage === 'dashboard' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50 font-semibold' : 'hover:bg-green-50 text-gray-700 hover:text-green-700'}`}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => { setCurrentPage('food'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPage === 'food' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50 font-semibold' : 'hover:bg-green-50 text-gray-700 hover:text-green-700'}`}
          >
            <Utensils size={20} />
            <span>Makanan</span>
          </button>
          <button
            onClick={() => { setCurrentPage('water'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPage === 'water' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50 font-semibold' : 'hover:bg-green-50 text-gray-700 hover:text-green-700'}`}
          >
            <Droplet size={20} />
            <span>Air Putih</span>
          </button>
          <button
            onClick={() => { setCurrentPage('nutrients'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPage === 'nutrients' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50 font-semibold' : 'hover:bg-green-50 text-gray-700 hover:text-green-700'}`}
          >
            <BarChart3 size={20} />
            <span>Detail Nutrisi</span>
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-green-100 space-y-2 bg-white">
          <button
            onClick={reminderEnabled ? () => setReminderEnabled(false) : enableReminder}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-semibold shadow-lg ${reminderEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/50' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Bell size={18} />
            <span>{reminderEnabled ? 'Reminder ON' : 'Reminder OFF'}</span>
          </button>
          <button
            onClick={loadTodayData}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all border border-blue-200"
          >
            <RefreshCw size={18} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/20 rounded-lg text-white">
            <Menu size={24} />
          </button>
          <h2 className="font-bold text-lg text-white">Food Tracker</h2>
          <button onClick={loadTodayData} className="p-2 hover:bg-white/20 rounded-lg text-white">
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Dashboard Page */}
        {currentPage === 'dashboard' && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">Dashboard Hari Ini</h2>
              <p className="text-gray-600">Tracking nutrisi harianmu</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all">
                <ProgressBar label="Kalori" current={totals.calories} target={DAILY_TARGETS.calories} unit="kcal" />
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all">
                <ProgressBar label="Protein" current={totals.protein} target={DAILY_TARGETS.protein} unit="g" />
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all">
                <ProgressBar label="Karbohidrat" current={totals.carbs} target={DAILY_TARGETS.carbs} unit="g" />
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all">
                <ProgressBar label="Lemak" current={totals.fat} target={DAILY_TARGETS.fat} unit="g" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border-2 border-green-100">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Nutrisi Tambahan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProgressBar label="Serat" current={totals.fiber} target={DAILY_TARGETS.fiber} unit="g" />
                <ProgressBar label="Gula" current={totals.sugar} target={DAILY_TARGETS.sugar} unit="g" />
                <ProgressBar label="Omega-3" current={totals.omega_3} target={DAILY_TARGETS.omega_3} unit="g" />
                <ProgressBar label="Omega-6" current={totals.omega_6} target={DAILY_TARGETS.omega_6} unit="g" />
                <ProgressBar label="Air" current={totals.water} target={DAILY_TARGETS.water} unit="ml" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-green-100">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Makanan Hari Ini ({foodLogs.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {foodLogs.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Belum ada data makanan</p>
                ) : (
                  foodLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2">
                        <span>{getMealEmoji(log.meal_time)}</span>
                        <span className="font-medium text-gray-800">{log.food_name}</span>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{log.calories} kcal</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Food Page */}
        {currentPage === 'food' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">Input Makanan</h2>
                <p className="text-gray-600">Catat makananmu hari ini</p>
              </div>
              <button
                onClick={() => setShowFoodForm(!showFoodForm)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center gap-2 font-semibold"
              >
                <Plus size={20} />
                Tambah Makanan
              </button>
            </div>

            {showFoodForm && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-800">Form Input Makanan</h3>
                  <button
                    onClick={() => setDetailedMode(!detailedMode)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
                  >
                    {detailedMode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {detailedMode ? 'Mode Simple' : 'Mode Detail (Semua Nutrisi)'}
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Nama makanan"
                  value={foodForm.foodName}
                  onChange={(e) => setFoodForm({ ...foodForm, foodName: e.target.value })}
                  className="w-full p-3 border-2 border-green-300 rounded-xl mb-3 bg-white text-gray-800 font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <input type="number" placeholder="Kalori (kcal)" value={foodForm.calories} onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })} className="p-3 border-2 border-green-300 rounded-xl font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" />
                  <input type="number" placeholder="Protein (g)" value={foodForm.protein} onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })} className="p-3 border-2 border-green-300 rounded-xl font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" />
                  <input type="number" placeholder="Karbo (g)" value={foodForm.carbs} onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })} className="p-3 border-2 border-green-300 rounded-xl font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" />
                  <input type="number" placeholder="Lemak (g)" value={foodForm.fat} onChange={(e) => setFoodForm({ ...foodForm, fat: e.target.value })} className="p-3 border-2 border-green-300 rounded-xl font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" />
                </div>

                {detailedMode && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3">Mikronutrien (Opsional)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <input type="number" placeholder="Serat (g)" value={foodForm.fiber} onChange={(e) => setFoodForm({ ...foodForm, fiber: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Gula (g)" value={foodForm.sugar} onChange={(e) => setFoodForm({ ...foodForm, sugar: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Garam (g)" value={foodForm.salt} onChange={(e) => setFoodForm({ ...foodForm, salt: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Omega-3 (g)" value={foodForm.omega_3} onChange={(e) => setFoodForm({ ...foodForm, omega_3: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Omega-6 (g)" value={foodForm.omega_6} onChange={(e) => setFoodForm({ ...foodForm, omega_6: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Vit A (mcg)" value={foodForm.vitamin_a} onChange={(e) => setFoodForm({ ...foodForm, vitamin_a: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Vit B1 (mg)" value={foodForm.vitamin_b1} onChange={(e) => setFoodForm({ ...foodForm, vitamin_b1: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Vit B2 (mg)" value={foodForm.vitamin_b2} onChange={(e) => setFoodForm({ ...foodForm, vitamin_b2: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Vit B3 (mg)" value={foodForm.vitamin_b3} onChange={(e) => setFoodForm({ ...foodForm, vitamin_b3: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Vit B5 (mg)" value={foodForm.vitamin_b5} onChange={(e) => setFoodForm({ ...foodForm, vitamin_b5: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Vit B6 (mg)" value={foodForm.vitamin_b6} onChange={(e) => setFoodForm({ ...foodForm, vitamin_b6: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Vit B12 (mcg)" value={foodForm.vitamin_b12} onChange={(e) => setFoodForm({ ...foodForm, vitamin_b12: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Folat (mcg)" value={foodForm.folate} onChange={(e) => setFoodForm({ ...foodForm, folate: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Biotin (mcg)" value={foodForm.biotin} onChange={(e) => setFoodForm({ ...foodForm, biotin: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Kolin (mg)" value={foodForm.choline} onChange={(e) => setFoodForm({ ...foodForm, choline: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Vit C (mg)" value={foodForm.vitamin_c} onChange={(e) => setFoodForm({ ...foodForm, vitamin_c: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Vit D (mcg)" value={foodForm.vitamin_d} onChange={(e) => setFoodForm({ ...foodForm, vitamin_d: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Vit E (mg)" value={foodForm.vitamin_e} onChange={(e) => setFoodForm({ ...foodForm, vitamin_e: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Vit K (mcg)" value={foodForm.vitamin_k} onChange={(e) => setFoodForm({ ...foodForm, vitamin_k: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Kalsium (mg)" value={foodForm.calcium} onChange={(e) => setFoodForm({ ...foodForm, calcium: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Fosfor (mg)" value={foodForm.phosphorus} onChange={(e) => setFoodForm({ ...foodForm, phosphorus: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Magnesium (mg)" value={foodForm.magnesium} onChange={(e) => setFoodForm({ ...foodForm, magnesium: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Besi (mg)" value={foodForm.iron} onChange={(e) => setFoodForm({ ...foodForm, iron: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Iodium (mcg)" value={foodForm.iodine} onChange={(e) => setFoodForm({ ...foodForm, iodine: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Seng (mg)" value={foodForm.zinc} onChange={(e) => setFoodForm({ ...foodForm, zinc: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Selenium (mcg)" value={foodForm.selenium} onChange={(e) => setFoodForm({ ...foodForm, selenium: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Mangan (mg)" value={foodForm.manganese} onChange={(e) => setFoodForm({ ...foodForm, manganese: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Fluor (mg)" value={foodForm.fluoride} onChange={(e) => setFoodForm({ ...foodForm, fluoride: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Kromium (mcg)" value={foodForm.chromium} onChange={(e) => setFoodForm({ ...foodForm, chromium: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Kalium (mg)" value={foodForm.potassium} onChange={(e) => setFoodForm({ ...foodForm, potassium: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Klor (mg)" value={foodForm.chloride} onChange={(e) => setFoodForm({ ...foodForm, chloride: e.target.value })} className="p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Tembaga (mg)" value={foodForm.copper} onChange={(e) => setFoodForm({ ...foodForm, copper: e.target.value })} className="p-2 border rounded-lg text-sm" />
                    </div>
                  </div>
                )}

                <select
                  value={foodForm.mealTime}
                  onChange={(e) => setFoodForm({ ...foodForm, mealTime: e.target.value })}
                  className="w-full p-3 border-2 rounded-lg mb-4"
                >
                  <option value="breakfast">Sarapan</option>
                  <option value="lunch">Makan Siang</option>
                  <option value="dinner">Makan Malam</option>
                  <option value="snack">Snack</option>
                </select>

                <div className="flex gap-2">
                  <button onClick={handleAddFood} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold">
                    Simpan
                  </button>
                  <button onClick={() => setShowFoodForm(false)} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400">
                    Batal
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Riwayat Makanan Hari Ini</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {foodLogs.length === 0 ? (
                  <p className="text-center py-8 text-gray-400">Belum ada data makanan hari ini</p>
                ) : (
                  foodLogs.map((log) => (
                    <div key={log.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{getMealEmoji(log.meal_time)}</span>
                            <h3 className="font-semibold text-gray-800">{log.food_name}</h3>
                          </div>
                          <div className="flex gap-3 text-sm text-gray-600 flex-wrap">
                            {log.calories && <span>🔥 {log.calories} kcal</span>}
                            {log.protein && <span>🥩 {log.protein}g</span>}
                            {log.carbs && <span>🍚 {log.carbs}g</span>}
                            {log.fat && <span>🧈 {log.fat}g</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-gray-400">{formatTime(log.created_at)}</span>
                          <button onClick={() => deleteFoodLog(log.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Water Page */}
        {currentPage === 'water' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Tracking Air Putih</h2>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="mb-6">
                <ProgressBar label="Air Hari Ini" current={totals.water} target={DAILY_TARGETS.water} unit="ml" />
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-3">Quick Add:</p>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => addWaterLog(250)} className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
                    250ml
                  </button>
                  <button onClick={() => addWaterLog(500)} className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
                    500ml
                  </button>
                  <button onClick={() => addWaterLog(1000)} className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
                    1L
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Riwayat Minum Hari Ini</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {waterLogs.length === 0 ? (
                  <p className="text-center py-8 text-gray-400">Belum minum air hari ini</p>
                ) : (
                  waterLogs.map((log) => (
                    <div key={log.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Droplet className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{log.amount_ml}ml</div>
                          <div className="text-xs text-gray-500">{formatTime(log.created_at)}</div>
                        </div>
                      </div>
                      <button onClick={() => deleteWaterLog(log.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Nutrients Detail Page */}
        {currentPage === 'nutrients' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Detail Nutrisi Lengkap</h2>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Vitamin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProgressBar label="Vitamin A" current={totals.vitamin_a} target={DAILY_TARGETS.vitamin_a} unit="mcg" />
                <ProgressBar label="Vitamin B1 (Thiamin)" current={totals.vitamin_b1} target={DAILY_TARGETS.vitamin_b1} unit="mg" />
                <ProgressBar label="Vitamin B2 (Riboflavin)" current={totals.vitamin_b2} target={DAILY_TARGETS.vitamin_b2} unit="mg" />
                <ProgressBar label="Vitamin B3 (Niacin)" current={totals.vitamin_b3} target={DAILY_TARGETS.vitamin_b3} unit="mg" />
                <ProgressBar label="Vitamin B5 (Pantothenic Acid)" current={totals.vitamin_b5} target={DAILY_TARGETS.vitamin_b5} unit="mg" />
                <ProgressBar label="Vitamin B6 (Pyridoxine)" current={totals.vitamin_b6} target={DAILY_TARGETS.vitamin_b6} unit="mg" />
                <ProgressBar label="Vitamin B12 (Cobalamin)" current={totals.vitamin_b12} target={DAILY_TARGETS.vitamin_b12} unit="mcg" />
                <ProgressBar label="Folat" current={totals.folate} target={DAILY_TARGETS.folate} unit="mcg" />
                <ProgressBar label="Biotin" current={totals.biotin} target={DAILY_TARGETS.biotin} unit="mcg" />
                <ProgressBar label="Kolin" current={totals.choline} target={DAILY_TARGETS.choline} unit="mg" />
                <ProgressBar label="Vitamin C" current={totals.vitamin_c} target={DAILY_TARGETS.vitamin_c} unit="mg" />
                <ProgressBar label="Vitamin D" current={totals.vitamin_d} target={DAILY_TARGETS.vitamin_d} unit="mcg" />
                <ProgressBar label="Vitamin E" current={totals.vitamin_e} target={DAILY_TARGETS.vitamin_e} unit="mg" />
                <ProgressBar label="Vitamin K" current={totals.vitamin_k} target={DAILY_TARGETS.vitamin_k} unit="mcg" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Mineral</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProgressBar label="Kalsium" current={totals.calcium} target={DAILY_TARGETS.calcium} unit="mg" />
                <ProgressBar label="Fosfor" current={totals.phosphorus} target={DAILY_TARGETS.phosphorus} unit="mg" />
                <ProgressBar label="Magnesium" current={totals.magnesium} target={DAILY_TARGETS.magnesium} unit="mg" />
                <ProgressBar label="Besi" current={totals.iron} target={DAILY_TARGETS.iron} unit="mg" />
                <ProgressBar label="Iodium" current={totals.iodine} target={DAILY_TARGETS.iodine} unit="mcg" />
                <ProgressBar label="Seng (Zinc)" current={totals.zinc} target={DAILY_TARGETS.zinc} unit="mg" />
                <ProgressBar label="Selenium" current={totals.selenium} target={DAILY_TARGETS.selenium} unit="mcg" />
                <ProgressBar label="Mangan" current={totals.manganese} target={DAILY_TARGETS.manganese} unit="mg" />
                <ProgressBar label="Fluor" current={totals.fluoride} target={DAILY_TARGETS.fluoride} unit="mg" />
                <ProgressBar label="Kromium" current={totals.chromium} target={DAILY_TARGETS.chromium} unit="mcg" />
                <ProgressBar label="Kalium" current={totals.potassium} target={DAILY_TARGETS.potassium} unit="mg" />
                <ProgressBar label="Natrium" current={totals.sodium} target={DAILY_TARGETS.sodium} unit="mg" />
                <ProgressBar label="Klor" current={totals.chloride} target={DAILY_TARGETS.chloride} unit="mg" />
                <ProgressBar label="Tembaga" current={totals.copper} target={DAILY_TARGETS.copper} unit="mg" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Nutrisi Lainnya</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProgressBar label="Serat" current={totals.fiber} target={DAILY_TARGETS.fiber} unit="g" />
                <ProgressBar label="Gula" current={totals.sugar} target={DAILY_TARGETS.sugar} unit="g" />
                <ProgressBar label="Garam" current={totals.salt} target={DAILY_TARGETS.salt} unit="g" />
                <ProgressBar label="Omega-3" current={totals.omega_3} target={DAILY_TARGETS.omega_3} unit="g" />
                <ProgressBar label="Omega-6" current={totals.omega_6} target={DAILY_TARGETS.omega_6} unit="g" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay untuk mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default FoodTrackerApp;