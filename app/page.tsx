'use client'

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Droplet, Utensils, Clock, Trash2, RefreshCw } from 'lucide-react';
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
}

const FoodTrackerApp = () => {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const [foodForm, setFoodForm] = useState<FoodFormData>({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    mealTime: 'breakfast'
  });

  // Load data saat pertama kali
  useEffect(() => {
    loadTodayData();
  }, []);

  // Water reminder (setiap 2 jam)
  useEffect(() => {
    if (!reminderEnabled) return;

    const interval = setInterval(() => {
      if (Notification.permission === 'granted') {
        new Notification('💧 Waktunya Minum Air!', {
          body: 'Jangan lupa minum air putih ya!',
          icon: '💧'
        });
      } else {
        alert('💧 Reminder: Waktunya minum air putih!');
      }
    }, 2 * 60 * 60 * 1000); // 2 jam

    return () => clearInterval(interval);
  }, [reminderEnabled]);

  // Load data hari ini dari database
  const loadTodayData = async () => {
    try {
      setLoading(true);
      
      // Get start of today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Load food logs
      const { data: foodData, error: foodError } = await supabase
        .from('food_logs')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });
      
      if (foodError) throw foodError;
      
      // Load water logs
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
      alert('✅ Reminder aktif! (Browser tidak support notifikasi)');
    }
  };

  // Tambah makanan ke database
  const handleAddFood = async () => {
    if (!foodForm.foodName.trim()) {
      alert('Nama makanan harus diisi!');
      return;
    }

    try {
      const { error } = await supabase
        .from('food_logs')
        .insert([
          {
            food_name: foodForm.foodName,
            calories: parseFloat(foodForm.calories) || null,
            protein: parseFloat(foodForm.protein) || null,
            carbs: parseFloat(foodForm.carbs) || null,
            fat: parseFloat(foodForm.fat) || null,
            meal_time: foodForm.mealTime
          }
        ])
        .select();

      if (error) throw error;

      // Reload data
      await loadTodayData();
      
      // Reset form
      setFoodForm({
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        mealTime: 'breakfast'
      });
      setShowFoodForm(false);
      
      alert('✅ Makanan berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding food:', error);
      alert('Error: ' + (error as Error).message);
    }
  };

  // Tambah air ke database
  const addWaterLog = async (amount: number) => {
    try {
      const { error } = await supabase
        .from('water_logs')
        .insert([
          {
            amount_ml: amount
          }
        ])
        .select();

      if (error) throw error;

      // Reload data
      await loadTodayData();
    } catch (error) {
      console.error('Error adding water:', error);
      alert('Error: ' + (error as Error).message);
    }
  };

  // Hapus makanan
  const deleteFoodLog = async (id: string) => {
    if (!confirm('Hapus data makanan ini?')) return;

    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadTodayData();
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Error: ' + (error as Error).message);
    }
  };

  // Hapus air
  const deleteWaterLog = async (id: string) => {
    if (!confirm('Hapus data air ini?')) return;

    try {
      const { error } = await supabase
        .from('water_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadTodayData();
    } catch (error) {
      console.error('Error deleting water:', error);
      alert('Error: ' + (error as Error).message);
    }
  };

  const todayCalories = foodLogs.reduce((sum, log) => sum + (parseFloat(String(log.calories)) || 0), 0);
  const todayProtein = foodLogs.reduce((sum, log) => sum + (parseFloat(String(log.protein)) || 0), 0);
  const todayCarbs = foodLogs.reduce((sum, log) => sum + (parseFloat(String(log.carbs)) || 0), 0);
  const todayFat = foodLogs.reduce((sum, log) => sum + (parseFloat(String(log.fat)) || 0), 0);
  const todayWater = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2 md:gap-3">
                <Utensils className="text-green-600" size={28} />
                Food Tracker
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Track makanan & minummu</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={loadTodayData}
                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex-1 sm:flex-initial"
              >
                <RefreshCw size={18} />
                <span className="text-sm md:text-base">Refresh</span>
              </button>
              <button
                onClick={reminderEnabled ? () => setReminderEnabled(false) : enableReminder}
                className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg transition flex-1 sm:flex-initial ${
                  reminderEnabled
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Bell size={18} />
                <span className="text-sm md:text-base">{reminderEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-3 md:p-4 border-l-4 border-orange-500">
            <div className="text-xs md:text-sm text-gray-600 truncate">Kalori</div>
            <div className="text-xl md:text-2xl font-bold text-orange-600">{todayCalories.toFixed(0)}</div>
            <div className="text-xs text-gray-500">kcal</div>
          </div>
          <div className="bg-white rounded-xl shadow p-3 md:p-4 border-l-4 border-red-500">
            <div className="text-xs md:text-sm text-gray-600 truncate">Protein</div>
            <div className="text-xl md:text-2xl font-bold text-red-600">{todayProtein.toFixed(1)}</div>
            <div className="text-xs text-gray-500">gram</div>
          </div>
          <div className="bg-white rounded-xl shadow p-3 md:p-4 border-l-4 border-yellow-500">
            <div className="text-xs md:text-sm text-gray-600 truncate">Karbo</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-600">{todayCarbs.toFixed(1)}</div>
            <div className="text-xs text-gray-500">gram</div>
          </div>
          <div className="bg-white rounded-xl shadow p-3 md:p-4 border-l-4 border-purple-500">
            <div className="text-xs md:text-sm text-gray-600 truncate">Lemak</div>
            <div className="text-xl md:text-2xl font-bold text-purple-600">{todayFat.toFixed(1)}</div>
            <div className="text-xs text-gray-500">gram</div>
          </div>
          <div className="bg-white rounded-xl shadow p-3 md:p-4 border-l-4 border-blue-500 col-span-2 md:col-span-1">
            <div className="text-xs md:text-sm text-gray-600 truncate">Air Hari Ini</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">{(todayWater / 1000).toFixed(1)}</div>
            <div className="text-xs text-gray-500">liter</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Food Section */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Utensils className="text-green-600" size={20} />
                Makanan
              </h2>
              <button
                onClick={() => setShowFoodForm(!showFoodForm)}
                className="bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm md:text-base"
              >
                <Plus size={18} />
                Tambah
              </button>
            </div>

            {showFoodForm && (
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <input
                  type="text"
                  placeholder="Nama makanan"
                  value={foodForm.foodName}
                  onChange={(e) => setFoodForm({ ...foodForm, foodName: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-800 placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Kalori"
                    value={foodForm.calories}
                    onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })}
                    className="p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Protein (g)"
                    value={foodForm.protein}
                    onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })}
                    className="p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Karbo (g)"
                    value={foodForm.carbs}
                    onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })}
                    className="p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Lemak (g)"
                    value={foodForm.fat}
                    onChange={(e) => setFoodForm({ ...foodForm, fat: e.target.value })}
                    className="p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <select
                  value={foodForm.mealTime}
                  onChange={(e) => setFoodForm({ ...foodForm, mealTime: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-2 bg-white text-gray-800 focus:border-green-500 focus:outline-none"
                >
                  <option value="breakfast">Sarapan</option>
                  <option value="lunch">Makan Siang</option>
                  <option value="dinner">Makan Malam</option>
                  <option value="snack">Snack</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={handleAddFood} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    Simpan
                  </button>
                  <button
                    onClick={() => setShowFoodForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {foodLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Belum ada data makanan hari ini
                </div>
              ) : (
                foodLogs.map((log) => (
                  <div key={log.id} className="bg-gray-50 rounded-lg p-3 md:p-4 hover:bg-gray-100 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg md:text-xl flex-shrink-0">{getMealEmoji(log.meal_time)}</span>
                          <h3 className="font-semibold text-gray-800 text-sm md:text-base truncate">{log.food_name}</h3>
                        </div>
                        <div className="flex gap-2 md:gap-4 text-xs md:text-sm text-gray-600 flex-wrap">
                          {log.calories && <span className="whitespace-nowrap">🔥 {log.calories} kcal</span>}
                          {log.protein && <span className="whitespace-nowrap">🥩 {log.protein}g</span>}
                          {log.carbs && <span className="whitespace-nowrap">🍚 {log.carbs}g</span>}
                          {log.fat && <span className="whitespace-nowrap">🧈 {log.fat}g</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10} />
                          {formatTime(log.created_at)}
                        </div>
                        <button
                          onClick={() => deleteFoodLog(log.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Water Section */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Droplet className="text-blue-600" size={20} />
                Air Putih
              </h2>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <div className="text-sm text-gray-600 mb-3">Quick Add:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => addWaterLog(250)}
                  className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
                >
                  250ml
                </button>
                <button
                  onClick={() => addWaterLog(500)}
                  className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
                >
                  500ml
                </button>
                <button
                  onClick={() => addWaterLog(1000)}
                  className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
                >
                  1L
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Target: 2L</span>
                <span className="font-semibold text-blue-600">{((todayWater / 2000) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((todayWater / 2000) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {waterLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Belum minum air hari ini
                </div>
              ) : (
                waterLogs.map((log) => (
                  <div key={log.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 transition">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                        <Droplet className="text-blue-600" size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-800 text-sm md:text-base">{log.amount_ml}ml</div>
                        <div className="text-xs text-gray-500">{formatTime(log.created_at)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteWaterLog(log.id)}
                      className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodTrackerApp;