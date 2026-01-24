import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerLayout from '../../components/layout/SellerLayout';
import authService from '../../services/authService';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    todaySales: 1240.00,
    salesGrowth: 12,
    pendingOrders: 12,
    lowStock: 4,
    avgRating: 4.8,
    ratingChange: -2
  });

  useEffect(() => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  return (
    <SellerLayout>
      <div className="p-8 max-w-7xl w-full mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Command Center</h2>
            <p className="text-slate-500 text-sm mt-1">Review your shop's performance and AI recommendations.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Last 24 Hours
            </button>
          </div>
        </div>

        {/* Performance Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Sales</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">${stats.todaySales.toFixed(2)}</span>
              <span className="text-xs font-bold text-green-600 flex items-center">
                +{stats.salesGrowth}% <span className="material-symbols-outlined text-xs">arrow_upward</span>
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Orders</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingOrders}</span>
              <span className="text-xs font-bold text-slate-400">Needs action</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.lowStock}</span>
              <span className="text-xs font-bold text-red-500">Alert</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Rating</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgRating}/5.0</span>
              <span className="text-xs font-bold text-amber-500 flex items-center">
                {stats.ratingChange}% <span className="material-symbols-outlined text-xs">arrow_downward</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Insights Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <h3 className="font-bold text-slate-900 dark:text-white">AI Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Tip Card */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded">AI TIP</span>
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Trending Product</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Demand for "Linen Shirts" is up 20%</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Data suggests a spike in regional demand. Consider moving these items to your "Featured" section.
                </p>
                <button className="text-xs font-bold text-primary hover:underline">Apply Recommendation</button>
              </div>

              {/* Price Alert Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    Price Alert
                  </span>
                  <span className="text-[10px] text-slate-400">vs. Competitors</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 italic">Your Price</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">$45.00</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[85%]"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 italic">Market Avg</span>
                    <span className="text-sm font-bold text-slate-500">$42.75</span>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-slate-500 font-medium">Your listing is 5% higher than average.</p>
              </div>
            </div>

            {/* Placeholder for Chart/Visual */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-64 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2513ec_1px,transparent_1px)] [background-size:20px_20px]"></div>
              <span className="material-symbols-outlined text-slate-300 text-5xl mb-2">insights</span>
              <p className="text-sm font-bold text-slate-400">Weekly Sales Distribution Chart</p>
              <div className="flex gap-2 mt-4 items-end h-20">
                <div className="w-4 bg-primary/20 rounded-t h-8"></div>
                <div className="w-4 bg-primary/40 rounded-t h-12"></div>
                <div className="w-4 bg-primary/30 rounded-t h-10"></div>
                <div className="w-4 bg-primary/60 rounded-t h-16"></div>
                <div className="w-4 bg-primary rounded-t h-20"></div>
                <div className="w-4 bg-primary/50 rounded-t h-14"></div>
              </div>
            </div>
          </div>

          {/* To-Do List */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-primary">checklist</span>
              <h3 className="font-bold text-slate-900 dark:text-white">Action Required</h3>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Task Item */}
                <div className="p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                  <div className="mt-1 h-5 w-5 border-2 border-slate-300 rounded flex items-center justify-center cursor-pointer group-hover:border-primary"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Ship 5 pending orders</p>
                    <p className="text-xs text-slate-500 mt-0.5">Estimated handling time: 15 mins</p>
                    <button 
                      onClick={() => navigate('/seller/orders')}
                      className="mt-3 bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
                    >
                      Ship Now
                    </button>
                  </div>
                </div>

                {/* Task Item */}
                <div className="p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                  <div className="mt-1 h-5 w-5 border-2 border-slate-300 rounded flex items-center justify-center cursor-pointer group-hover:border-primary"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Restock 2 low-inventory items</p>
                    <p className="text-xs text-slate-500 mt-0.5">Items: Wool Beanie (2), Silk Scarf (1)</p>
                  </div>
                  <button className="p-1.5 text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>

                {/* Task Item */}
                <div className="p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                  <div className="mt-1 h-5 w-5 border-2 border-slate-300 rounded flex items-center justify-center cursor-pointer group-hover:border-primary"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Respond to 3 inquiries</p>
                    <p className="text-xs text-slate-500 mt-0.5">Avg response time: 2 hours</p>
                  </div>
                  <button className="p-1.5 text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 text-center border-t border-slate-100 dark:border-slate-800">
                <button className="text-xs font-bold text-slate-500 hover:text-slate-700">View All Tasks (8)</button>
              </div>
            </div>

            {/* Mini Support Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl text-white relative overflow-hidden">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/10 text-8xl rotate-12">help</span>
              <h4 className="text-sm font-bold relative z-10">Need help with your shop?</h4>
              <p className="text-[11px] text-slate-400 mt-1 relative z-10">Our advisors are available 24/7 to help you grow your brand.</p>
              <button className="mt-4 bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-lg relative z-10">Get Expert Advice</button>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerDashboard;
