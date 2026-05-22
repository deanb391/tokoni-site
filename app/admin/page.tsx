// app/admin/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { 
  Users, 
  Store, 
  Film, 
  ShoppingBag, 
  MessageSquare, 
  RefreshCw, 
  ArrowLeft,
  TrendingUp,
  Loader2,
  Calendar,
  AlertCircle
} from "lucide-react";

// Dynamically check recharts import
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface StatItem {
  date: string;
  dau: number;
  mau: number;
  dav: number;
  mav: number;
  signups: number;
  vendorsSignedUp: number;
  postsCreated: number;
  productsCreated: number;
  avgWatchTime: number;
  totalWatchTime: number;
  postsEngaged: number;
  productsEngaged: number;
  activeChats: number;
  cartsSent: number;
}

interface Totals {
  users: number;
  vendors: number;
  posts: number;
  products: number;
  chats: number;
}

type TabType = "acquisitions" | "vendors" | "activity";
type IntervalType = "7days" | "30days" | "3months" | "1year" | "2years";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [activeTab, setActiveTab] = useState<TabType>("acquisitions");
  const [interval, setInterval] = useState<IntervalType>("30days");
  
  const [statsData, setStatsData] = useState<StatItem[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load Dashboard Data
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await fetch("/api/admin/track-daily-stats");
      const data = await res.json();
      if (data.success) {
        setStatsData(data.stats || []);
        setTotals(data.totals || null);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Redirect if not admin
    if (!userLoading) {
      if (!user || !user.isAdmin) {
        router.replace("/");
      } else {
        fetchData();
      }
    }
  }, [user, userLoading, router]);

  // Filter stats data by interval
  const filteredData = useMemo(() => {
    if (!statsData.length) return [];
    
    let daysToKeep = 30;
    if (interval === "7days") daysToKeep = 7;
    else if (interval === "30days") daysToKeep = 30;
    else if (interval === "3months") daysToKeep = 90;
    else if (interval === "1year") daysToKeep = 365;
    else if (interval === "2years") daysToKeep = 730;

    return statsData.slice(-daysToKeep);
  }, [statsData, interval]);

  // Calculate Interval Aggregates
  const aggregates = useMemo(() => {
    const defaultAggs = {
      signups: 0,
      vendorsSignedUp: 0,
      postsCreated: 0,
      productsCreated: 0,
      avgWatchTime: 0,
      totalWatchTime: 0,
      postsEngaged: 0,
      productsEngaged: 0,
      cartsSent: 0,
    };

    if (!filteredData.length) return defaultAggs;

    const sum = filteredData.reduce((acc, curr) => {
      acc.signups += curr.signups || 0;
      acc.vendorsSignedUp += curr.vendorsSignedUp || 0;
      acc.postsCreated += curr.postsCreated || 0;
      acc.productsCreated += curr.productsCreated || 0;
      acc.totalWatchTime += curr.totalWatchTime || 0;
      acc.postsEngaged += curr.postsEngaged || 0;
      acc.productsEngaged += curr.productsEngaged || 0;
      acc.cartsSent += curr.cartsSent || 0;
      return acc;
    }, { ...defaultAggs });

    const avgWatch = filteredData.reduce((sumTime, curr) => sumTime + (curr.avgWatchTime || 0), 0) / filteredData.length;
    sum.avgWatchTime = parseFloat(avgWatch.toFixed(1));
    sum.totalWatchTime = parseFloat(sum.totalWatchTime.toFixed(1));

    return sum;
  }, [filteredData]);

  // Format Date Labels
  const formattedChartData = useMemo(() => {
    return filteredData.map(d => ({
      ...d,
      formattedDate: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    }));
  }, [filteredData]);

  // Render Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-neutral-200 p-3 rounded-xl shadow-lg text-neutral-800">
          <p className="text-xs font-bold text-neutral-500 mb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="text-sm font-semibold" style={{ color: item.color }}>
              {item.name}: <span className="font-extrabold text-neutral-900">{item.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl h-[260px] text-center w-full">
      <AlertCircle className="w-10 h-10 text-neutral-300 mb-2" />
      <h4 className="text-sm font-bold text-neutral-700">No activity recorded</h4>
      <p className="text-xs text-neutral-500 mt-1 max-w-xs">
        Data points will show here once platform actions occur on the client side.
      </p>
    </div>
  );

  if (userLoading || loading || !mounted) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#B9001B] animate-spin" />
        <p className="text-sm font-semibold tracking-wider text-neutral-500">LOADING ANALYTICS ENGINE...</p>
      </div>
    );
  }

  if (!user || !user.isAdmin) return null;

  const hasData = formattedChartData.length > 0;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-neutral-900 flex flex-col font-sans antialiased pb-12">
      
      {/* Premium Light Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/menu")}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-950">
              Tokoni Command Center
            </h1>
            <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase">ADMINISTRATIVE ANALYTICS ENGINE</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Control */}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#B9001B] hover:bg-[#a00017] text-xs font-bold text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 mt-8 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Stats Rollup Panel */}
        <section className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold tracking-wider text-neutral-400 mb-6 uppercase">Platform Lifespan Totals</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">TOTAL REGISTERED USERS</span>
                  <span className="text-xl font-extrabold tracking-tight text-neutral-900">
                    {totals?.users ? totals.users.toLocaleString() : 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">VERIFIED VENDORS</span>
                  <span className="text-xl font-extrabold tracking-tight text-neutral-900">
                    {totals?.vendors ? totals.vendors.toLocaleString() : 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#B9001B] border border-rose-100">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">TOTAL CREATED POSTS</span>
                  <span className="text-xl font-extrabold tracking-tight text-neutral-900">
                    {totals?.posts ? totals.posts.toLocaleString() : 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">TOTAL PRODUCTS LISTED</span>
                  <span className="text-xl font-extrabold tracking-tight text-neutral-900">
                    {totals?.products ? totals.products.toLocaleString() : 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ACTIVE CHAT ROOMS</span>
                  <span className="text-xl font-extrabold tracking-tight text-neutral-900">
                    {totals?.chats ? totals.chats.toLocaleString() : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Charts Pane */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Controls Tray */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
            {/* Tabs Selector */}
            <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200">
              <button
                onClick={() => setActiveTab("acquisitions")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "acquisitions" 
                    ? "bg-[#B9001B] text-white shadow-sm" 
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Acquisitions
              </button>
              <button
                onClick={() => setActiveTab("vendors")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "vendors" 
                    ? "bg-[#B9001B] text-white shadow-sm" 
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Vendor Activity
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "activity" 
                    ? "bg-[#B9001B] text-white shadow-sm" 
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                General Engagement
              </button>
            </div>

            {/* Intervals Selector */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
              {(["7days", "30days", "3months", "1year", "2years"] as IntervalType[]).map((int) => (
                <button
                  key={int}
                  onClick={() => setInterval(int)}
                  className={`px-2.5 py-1.5 text-[10px] font-extrabold rounded-lg uppercase tracking-wider transition-all ${
                    interval === int 
                      ? "bg-white text-neutral-900 shadow-sm border border-neutral-200" 
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {int.replace("days", "D").replace("months", "M").replace("year", "1Y").replace("years", "2Y")}
                </button>
              ))}
            </div>
          </div>

          {/* Acquisitions Tab */}
          {activeTab === "acquisitions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Daily Signups Line/Area Chart */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col shadow-sm">
                <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Users Acquired Over Interval</span>
                <span className="text-2xl font-extrabold tracking-tight mt-1 text-neutral-900">
                  {aggregates.signups.toLocaleString()}
                </span>
                
                <div className="h-[240px] mt-6 w-full">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#B9001B" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#B9001B" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="formattedDate" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                        <Area type="monotone" dataKey="signups" name="New Signups" stroke="#B9001B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSignups)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : renderEmptyState()}
                </div>
              </div>

              {/* Active Users (DAU / MAU) Chart */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Daily Active Users (DAU)</span>
                    <span className="block text-2xl font-extrabold tracking-tight mt-1 text-neutral-900">
                      {formattedChartData.length > 0 ? formattedChartData[formattedChartData.length - 1].dau.toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">Monthly Active (MAU)</span>
                    <span className="block text-sm font-extrabold text-neutral-700 mt-1">
                      {formattedChartData.length > 0 ? formattedChartData[formattedChartData.length - 1].mau.toLocaleString() : 0}
                    </span>
                  </div>
                </div>

                <div className="h-[240px] mt-6 w-full">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="formattedDate" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                        <Bar dataKey="dau" name="Daily Active (DAU)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="mau" name="Monthly Active (MAU)" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : renderEmptyState()}
                </div>
              </div>

            </div>
          )}

          {/* Vendors Tab */}
          {activeTab === "vendors" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Vendor Signups Area Chart */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col shadow-sm">
                <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Vendors Onboarded Over Interval</span>
                <span className="text-2xl font-extrabold tracking-tight mt-1 text-neutral-900">
                  {aggregates.vendorsSignedUp.toLocaleString()}
                </span>
                
                <div className="h-[240px] mt-6 w-full">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVendors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="formattedDate" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                        <Area type="monotone" dataKey="vendorsSignedUp" name="New Vendors" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVendors)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : renderEmptyState()}
                </div>
              </div>

              {/* Active Vendors (DAV / MAV) Chart */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Daily Active Vendors (DAV)</span>
                    <span className="block text-2xl font-extrabold tracking-tight mt-1 text-neutral-900">
                      {formattedChartData.length > 0 ? formattedChartData[formattedChartData.length - 1].dav.toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">Monthly Active (MAV)</span>
                    <span className="block text-sm font-extrabold text-neutral-700 mt-1">
                      {formattedChartData.length > 0 ? formattedChartData[formattedChartData.length - 1].mav.toLocaleString() : 0}
                    </span>
                  </div>
                </div>

                <div className="h-[240px] mt-6 w-full">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="formattedDate" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                        <Bar dataKey="dav" name="Active Vendors" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="mav" name="Monthly Active Vendors" fill="#A7F3D0" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : renderEmptyState()}
                </div>
              </div>

              {/* Vendor Posts (Reels Created) Chart */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col shadow-sm">
                <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Reels Uploaded Over Interval</span>
                <span className="text-2xl font-extrabold tracking-tight mt-1 text-neutral-900">
                  {aggregates.postsCreated.toLocaleString()}
                </span>
                
                <div className="h-[200px] mt-6 w-full">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="formattedDate" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="postsCreated" name="Reels Created" fill="#E11D48" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : renderEmptyState()}
                </div>
              </div>

              {/* Vendor Products Created Chart */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col shadow-sm">
                <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Products Listed Over Interval</span>
                <span className="text-2xl font-extrabold tracking-tight mt-1 text-neutral-900">
                  {aggregates.productsCreated.toLocaleString()}
                </span>
                
                <div className="h-[200px] mt-6 w-full">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="formattedDate" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="productsCreated" name="Products Listed" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : renderEmptyState()}
                </div>
              </div>

            </div>
          )}

          {/* General Activity Tab */}
          {activeTab === "activity" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Reels Watch Time Area Chart */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col md:col-span-2 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Average Video Reels Watch Time</span>
                    <span className="block text-2xl font-extrabold tracking-tight mt-1 text-neutral-900">
                      {aggregates.avgWatchTime}s
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">Total watch duration</span>
                    <span className="block text-sm font-extrabold text-neutral-700 mt-1">
                      {aggregates.totalWatchTime.toLocaleString()}s
                    </span>
                  </div>
                </div>

                <div className="h-[240px] mt-6 w-full">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="formattedDate" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                        <Area type="monotone" dataKey="avgWatchTime" name="Average Watch Time (s)" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWatchTime)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : renderEmptyState()}
                </div>
              </div>

              {/* Shopping Carts Shared to Chat */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col md:col-span-1 shadow-sm">
                <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Carts Shared to Chat</span>
                <span className="text-2xl font-extrabold tracking-tight mt-1 text-neutral-900">
                  {aggregates.cartsSent.toLocaleString()}
                </span>
                
                <div className="h-[240px] mt-6 w-full">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="formattedDate" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="cartsSent" name="Carts Shared" fill="#F97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : renderEmptyState()}
                </div>
              </div>

              {/* Detailed metrics box */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col md:col-span-3 shadow-sm">
                <h3 className="text-xs font-bold tracking-wider text-neutral-400 uppercase mb-4">Interval Interaction Metrics</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl shadow-inner">
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Reels Engaged</span>
                    <span className="text-lg font-extrabold mt-1 block text-neutral-900">
                      {aggregates.postsEngaged.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl shadow-inner">
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Products Engaged</span>
                    <span className="text-lg font-extrabold mt-1 block text-neutral-900">
                      {aggregates.productsEngaged.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl shadow-inner">
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Carts Pushed</span>
                    <span className="text-lg font-extrabold mt-1 block text-neutral-900">
                      {aggregates.cartsSent.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl shadow-inner">
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Avg Daily Signups</span>
                    <span className="text-lg font-extrabold mt-1 block text-neutral-900">
                      {hasData ? (aggregates.signups / formattedChartData.length).toFixed(1) : 0}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}
