import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingsApi } from '../api/listingsApi';
import { ordersApi } from '../api/ordersApi';
import apiClient from '../api/client';
import {
  ShieldCheck,
  Users,
  Sprout,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  Eye,
  Sliders,
  RefreshCw,
  Award,
  Lock,
  ArrowUpRight,
  ChevronRight,
  Activity,
  Zap,
  BarChart3,
  Scale,
  UserCheck
} from 'lucide-react';
import { Card } from '../components/Card';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDashboard = () => {
  const { user, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // State collections
  const [usersList, setUsersList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [listingFilter, setListingFilter] = useState('ALL');

  // System Settings state
  const [commissionRate, setCommissionRate] = useState(1.5);
  const [mandiSyncActive, setMandiSyncActive] = useState(true);
  const [bannerNotice, setBannerNotice] = useState('Harvest Season Special: 0% fee on first 5 orders!');
  const [bannerActive, setBannerActive] = useState(true);

  // Dispute tickets state
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch real users from /users API
      let uList = [];
      try {
        const uRes = await apiClient.get('/users');
        uList = uRes.data?.data || uRes.data || [];
      } catch (err) {
        const storedUsersRaw = localStorage.getItem('agri_users');
        uList = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      }
      setUsersList(Array.isArray(uList) ? uList : []);

      // 2. Fetch real listings from /listings API
      const lList = await listingsApi.getListings();
      setListingsList(lList || []);

      // 3. Fetch real orders from /orders API
      let oList = [];
      try {
        const oRes = await apiClient.get('/orders');
        oList = oRes.data?.data || oRes.data || [];
      } catch (err) {
        oList = await ordersApi.getMine();
      }
      setOrdersList(Array.isArray(oList) ? oList : []);
    } catch (e) {
      toast.error('Failed to load admin records');
    } finally {
      setLoading(false);
    }
  };

  // User Status Actions
  const toggleUserVerification = (userId) => {
    const updated = usersList.map((u) => {
      if (u.user_id === userId) {
        const isVer = u.verified !== false;
        return { ...u, verified: !isVer };
      }
      return u;
    });
    setUsersList(updated);
    localStorage.setItem('agri_users', JSON.stringify(updated));
    toast.success('User verification status updated');
  };

  const toggleUserStatus = (userId) => {
    const updated = usersList.map((u) => {
      if (u.user_id === userId) {
        const isSusp = u.status === 'SUSPENDED';
        return { ...u, status: isSusp ? 'ACTIVE' : 'SUSPENDED' };
      }
      return u;
    });
    setUsersList(updated);
    localStorage.setItem('agri_users', JSON.stringify(updated));
    toast.success('User account status updated');
  };

  // Crop Listing Approvals
  const handleApproveListing = (listingId) => {
    const updated = listingsList.map((l) =>
      l.listing_id === listingId ? { ...l, verified_by_admin: true, status: 'AVAILABLE' } : l
    );
    setListingsList(updated);
    toast.success('Listing verified & approved for direct buyer bidding!');
  };

  const handleRejectListing = (listingId) => {
    const updated = listingsList.map((l) =>
      l.listing_id === listingId ? { ...l, status: 'REJECTED' } : l
    );
    setListingsList(updated);
    toast.error('Listing rejected');
  };

  // Dispute Resolution
  const handleResolveDispute = (disputeId, resolution) => {
    const updated = disputes.map((d) =>
      d.dispute_id === disputeId ? { ...d, status: 'RESOLVED', resolution } : d
    );
    setDisputes(updated);
    toast.success(`Dispute resolved: ${resolution}`);
  };

  // Demo role switcher helper
  const handleSwitchDemo = (role) => {
    switchDemoRole(role);
    if (role === 'FARMER') {
      navigate('/farmer-dashboard');
    } else if (role === 'BUYER') {
      navigate('/buyer-dashboard');
    }
  };

  // Metrics Calculations
  const totalGMV = ordersList.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const totalCommission = Math.round(totalGMV * (commissionRate / 100));
  const activeFarmersCount = usersList.filter((u) => u.role === 'FARMER').length;
  const activeBuyersCount = usersList.filter((u) => u.role === 'BUYER').length;
  const pendingApprovalsCount = listingsList.filter((l) => !l.verified_by_admin).length;
  const openDisputesCount = disputes.filter((d) => d.status === 'OPEN').length;

  const filteredUsers = usersList.filter((u) => {
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* 1. TOP DARK GREEN APMC HEADER BANNER (Matching Farmer & Buyer portals) */}
      <div className="bg-gradient-to-r from-[#032717] via-[#063821] to-[#042416] text-white rounded-2xl p-5 sm:p-6 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[11px] font-bold border border-amber-500/30 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Central APMC Governance & Admin Control
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            Agriसाथी Master Control Panel
          </h1>
          <p className="text-xs text-emerald-200/90 font-medium flex items-center gap-2 flex-wrap">
            <span>
              Administrator: <strong className="text-amber-300 font-bold">{user?.name || 'APMC Director'}</strong> ({user?.email})
            </span>
            <span>•</span>
            <span className="text-emerald-300 font-bold">System Status: LIVE</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => handleSwitchDemo('FARMER')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm border border-emerald-500/30"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-300" /> Ramesh (Farmer)
          </button>
          <button
            onClick={() => handleSwitchDemo('BUYER')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm border border-amber-500/30"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-300" /> Vikram (Buyer)
          </button>
          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Data
          </button>
        </div>
      </div>

      {/* 2. OVERVIEW METRIC STAT CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Volume (GMV)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">₹{(totalGMV / 100000).toFixed(2)} Lakhs</div>
          <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% this week
          </div>
        </Card>

        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Platform Fee ({commissionRate}%)</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-900 mt-2">₹{totalCommission.toLocaleString('en-IN')}</div>
          <div className="text-[11px] font-semibold text-purple-700 mt-1">APMC platform revenue</div>
        </Card>

        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">{usersList.length} Accounts</div>
          <div className="text-[11px] font-semibold text-blue-700 mt-1">
            {activeFarmersCount} Farmers | {activeBuyersCount} Buyers
          </div>
        </Card>

        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Pending Approvals</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-700 mt-2">{pendingApprovalsCount} Listings</div>
          <div className="text-[11px] font-semibold text-amber-600 mt-1">Quality check required</div>
        </Card>

        <Card className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-4 relative overflow-hidden col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Open Disputes</span>
            <Scale className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-700 mt-2">{openDisputesCount} Tickets</div>
          <div className="text-[11px] font-semibold text-rose-600 mt-1">Escrow held pending review</div>
        </Card>
      </div>

      {/* 3. TAB NAVIGATION BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
          { id: 'users', label: `User Management (${usersList.length})`, icon: Users },
          { id: 'listings', label: `Crop Verification (${listingsList.length})`, icon: Sprout },
          { id: 'orders', label: `Orders & Escrow (${ordersList.length})`, icon: ShoppingBag },
          { id: 'disputes', label: `Dispute Tickets (${disputes.length})`, icon: Scale },
          { id: 'settings', label: 'Platform Controls', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white font-black shadow-md shadow-emerald-700/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Quick Action Card */}
            <Card className="lg:col-span-2 bg-white border-slate-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" /> Operational Summary
                </h3>
                <span className="text-xs text-slate-500 font-semibold">Live System Status</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                  <div className="text-xs text-emerald-800 font-bold uppercase">Active Mandi Tickers</div>
                  <div className="text-lg font-black text-emerald-900 mt-1">14 APMC Yards</div>
                  <p className="text-[11px] text-emerald-700 mt-1">Lasalgaon, Sehore, Karnal, Kolar</p>
                </div>

                <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
                  <div className="text-xs text-purple-800 font-bold uppercase">Direct UPI Escrow Pool</div>
                  <div className="text-lg font-black text-purple-900 mt-1">₹1,98,900 Active</div>
                  <p className="text-[11px] text-purple-700 mt-1">Held securely until buyer confirms</p>
                </div>

                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                  <div className="text-xs text-blue-800 font-bold uppercase">Quality Standard</div>
                  <div className="text-lg font-black text-blue-900 mt-1">NABL Certified</div>
                  <p className="text-[11px] text-blue-700 mt-1">Grade A+ verification checklist</p>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2.5">
                  Quick Admin & Switcher Actions
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSwitchDemo('FARMER')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-300" /> Switch to Ramesh (Farmer)
                  </button>
                  <button
                    onClick={() => handleSwitchDemo('BUYER')}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-200" /> Switch to Vikram (Buyer)
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sprout className="w-3.5 h-3.5 text-emerald-400" /> Review Crop Approvals ({pendingApprovalsCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('disputes')}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" /> Resolve Open Disputes ({openDisputesCount})
                  </button>
                </div>
              </div>
            </Card>

            {/* System Health */}
            <Card className="bg-white border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> System Health Status
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="font-extrabold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mandi API Data Sync
                  </div>
                  <p className="text-emerald-900 font-medium">Live benchmark prices synced 5 mins ago.</p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                  <div className="font-extrabold text-purple-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Instant UPI Gateway
                  </div>
                  <p className="text-purple-900 font-medium">99.8% payment claim verification success rate.</p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="font-extrabold text-amber-800 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> Verified Badges
                  </div>
                  <p className="text-amber-900 font-medium">88% of listed farmers hold APMC verified badges.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <Card className="bg-white border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Registered Farmers & Wholesale Buyers</h3>
              <p className="text-xs text-slate-500">Manage account verification badges, roles, and status</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">All Roles</option>
                <option value="FARMER">Farmers Only</option>
                <option value="BUYER">Buyers Only</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 bg-slate-50/80 tracking-wider">
                  <th className="py-3 px-3">User & Contact</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Profile Details</th>
                  <th className="py-3 px-3">Verified Badge</th>
                  <th className="py-3 px-3">Account Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredUsers.map((u) => {
                  const isFarmer = u.role === 'FARMER';
                  const isAdmin = u.role === 'ADMIN';
                  const isVerified = u.verified !== false;
                  const isSuspended = u.status === 'SUSPENDED';

                  return (
                    <tr key={u.user_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-slate-900">{u.name}</div>
                        <div className="text-slate-500 text-[11px]">{u.email}</div>
                        <div className="text-slate-500 text-[11px] font-mono">{u.phone || 'N/A'}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                            isAdmin
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : isFarmer
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-700 max-w-xs">
                        {isFarmer ? (
                          <div>
                            <div>📍 {u.profile?.village || 'Nashik'}, {u.profile?.district || 'MH'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">UPI: {u.profile?.upi_id || 'N/A'}</div>
                          </div>
                        ) : isAdmin ? (
                          <div className="text-purple-700 font-semibold">{u.profile?.department || 'System Admin'}</div>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-900">{u.profile?.business_name || 'Trader'}</div>
                            <div className="text-[11px] text-slate-500">{u.profile?.city || 'Mumbai'} ({u.profile?.buyer_type})</div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => toggleUserVerification(u.user_id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 border border-slate-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isVerified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            isSuspended ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        {!isAdmin && (
                          <button
                            onClick={() => toggleUserStatus(u.user_id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                              isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                            }`}
                          >
                            {isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: CROP LISTINGS APPROVAL */}
      {activeTab === 'listings' && (
        <Card className="bg-white border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Farmer Crop Verification & Quality Inspection</h3>
              <p className="text-xs text-slate-500">Review farmer direct crop listings before publishing to wholesale buyers</p>
            </div>

            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
              {pendingApprovalsCount} Pending Approval
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listingsList.map((listing) => {
              const isVerified = listing.verified_by_admin || listing.status === 'AVAILABLE';
              const isRejected = listing.status === 'REJECTED';

              return (
                <div
                  key={listing.listing_id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={listing.image_url}
                      alt={listing.product_name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">{listing.product_name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            isRejected
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isVerified
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isRejected ? 'REJECTED' : isVerified ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </div>
                      <p className="text-xs font-black text-emerald-700 mt-0.5">
                        ₹{listing.price_per_unit} / {listing.unit}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Qty: <span className="text-slate-900 font-bold">{listing.quantity} {listing.unit}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Farmer:</span>
                      <span className="font-bold text-slate-900">{listing.farmer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="text-slate-700">{listing.farmer_location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Grade:</span>
                      <span className="font-bold text-amber-700">{listing.quality_grade}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {!isVerified && (
                      <button
                        onClick={() => handleApproveListing(listing.listing_id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Listing
                      </button>
                    )}
                    {!isRejected && (
                      <button
                        onClick={() => handleRejectListing(listing.listing_id)}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB 4: ORDERS & ESCROW */}
      {activeTab === 'orders' && (
        <Card className="bg-white border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Live Transactions & UPI Payment Escrow Pool</h3>
              <p className="text-xs text-slate-500">Track order statuses, payment claims, and platform commission</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 bg-slate-50/80 tracking-wider">
                  <th className="py-3 px-3">Order ID & Date</th>
                  <th className="py-3 px-3">Crop Produce</th>
                  <th className="py-3 px-3">Farmer $\rightarrow$ Buyer</th>
                  <th className="py-3 px-3">Amount & Fee ({commissionRate}%)</th>
                  <th className="py-3 px-3">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {ordersList.map((order) => {
                  const fee = Math.round(order.total_amount * (commissionRate / 100));

                  return (
                    <tr key={order.order_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-extrabold text-emerald-700">#{order.order_id}</div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(order.order_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {order.product_name}
                        <div className="text-[11px] font-normal text-slate-500">
                          {order.quantity} {order.unit} @ ₹{order.price_per_unit}/{order.unit}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-emerald-800">🌾 {order.farmer_name}</div>
                        <div className="font-bold text-amber-800 mt-0.5">🛒 {order.buyer_name}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-black text-slate-900">₹{order.total_amount.toLocaleString('en-IN')}</div>
                        <div className="text-[11px] text-purple-700 font-semibold">Admin Fee: ₹{fee}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                            order.payment?.payment_status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {order.payment?.payment_status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 5: DISPUTE RESOLUTION */}
      {activeTab === 'disputes' && (
        <Card className="bg-white border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Dispute & Quality Claim Arbitrations</h3>
            <p className="text-xs text-slate-500">Review quality discrepancies or delivery delays between farmers & buyers</p>
          </div>

          <div className="space-y-4">
            {disputes.map((dispute) => {
              const isOpen = dispute.status === 'OPEN';

              return (
                <div
                  key={dispute.dispute_id}
                  className={`p-4 rounded-2xl border ${
                    isOpen ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border-slate-200'
                  } space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-rose-600" />
                      <h4 className="font-extrabold text-slate-900 text-sm">Dispute #{dispute.dispute_id}</h4>
                      <span className="text-xs text-slate-500 font-mono">Order #{dispute.order_id}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isOpen ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200 font-medium">
                    <span className="font-bold text-amber-800">Issue Claim:</span> {dispute.issue}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-600">
                      Farmer: <span className="text-emerald-800 font-bold">{dispute.farmer_name}</span> | Buyer:{' '}
                      <span className="text-amber-800 font-bold">{dispute.buyer_name}</span> | Amount:{' '}
                      <span className="text-slate-900 font-extrabold">₹{dispute.amount.toLocaleString('en-IN')}</span>
                    </div>

                    {isOpen && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolveDispute(dispute.dispute_id, 'Release Escrow to Farmer')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-sm"
                        >
                          Release to Farmer
                        </button>
                        <button
                          onClick={() => handleResolveDispute(dispute.dispute_id, 'Full Refund to Buyer')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-sm"
                        >
                          Refund to Buyer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB 6: PLATFORM SETTINGS */}
      {activeTab === 'settings' && (
        <Card className="bg-white border-slate-200 p-6 space-y-6 max-w-3xl shadow-sm">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Platform System & Mandi Configurations</h3>
            <p className="text-xs text-slate-500">Adjust fee percentages, live tickers, and emergency announcements</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                APMC Platform Fee / Commission Rate (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={commissionRate}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setCommissionRate(Math.max(0, Number(e.target.value) || 0))}
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-emerald-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
                <span className="text-xs text-slate-500">Applied automatically to gross order totals</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase">Live Agmarknet Mandi Price Sync</h4>
                <p className="text-[11px] text-slate-500">Automatically update daily benchmark prices every hour</p>
              </div>
              <button
                onClick={() => {
                  setMandiSyncActive(!mandiSyncActive);
                  toast.success(`Mandi price sync ${!mandiSyncActive ? 'enabled' : 'disabled'}`);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                  mandiSyncActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {mandiSyncActive ? 'Active' : 'Paused'}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase">Broadcast Announcement Banner</h4>
                  <p className="text-[11px] text-slate-500">Display notification banner across farmer & buyer portals</p>
                </div>
                <button
                  onClick={() => {
                    setBannerActive(!bannerActive);
                    toast.success(`Notice banner ${!bannerActive ? 'activated' : 'hidden'}`);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                    bannerActive ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {bannerActive ? 'Visible' : 'Hidden'}
                </button>
              </div>

              {bannerActive && (
                <input
                  type="text"
                  value={bannerNotice}
                  onChange={(e) => setBannerNotice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
