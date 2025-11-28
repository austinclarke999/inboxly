import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Mail,
    Trash2,
    DollarSign,
    Sparkles,
    Target,
    Award,
    Zap,
    RefreshCw
} from 'lucide-react';
import { mockStats, mockActivity, mockBadges } from '../lib/mockData';

export default function Dashboard() {
    const [stats, setStats] = useState(mockStats);
    const [isLoading, setIsLoading] = useState(false);

    const handleSync = async () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setStats({
                ...stats,
                emailsProcessed: stats.emailsProcessed + Math.floor(Math.random() * 50),
                inboxHealthScore: Math.min(100, stats.inboxHealthScore + Math.floor(Math.random() * 5)),
            });
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Header */}
            <div className="glass-card p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-dark-50 mb-2">
                            Welcome back! 👋
                        </h1>
                        <p className="text-dark-400">
                            Your inbox is looking cleaner. Keep up the great work!
                        </p>
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={isLoading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <RefreshCw className="w-5 h-5 mr-2 inline animate-spin" />
                        ) : (
                            <Sparkles className="w-5 h-5 mr-2 inline" />
                        )}
                        {isLoading ? 'Syncing...' : 'Sync Emails'}
                    </button>
                </div>
            </div>

            {/* Inbox Health Score */}
            <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-display font-bold text-dark-50 mb-1">
                            Inbox Health Score
                        </h2>
                        <p className="text-sm text-dark-400">
                            Based on noise reduction and organization
                        </p>
                    </div>
                    <div className="badge-success">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +12% this week
                    </div>
                </div>

                {/* Circular Progress */}
                <div className="flex items-center justify-center mb-6">
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                className="text-dark-800"
                            />
                            <motion.circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="url(#gradient)"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={`${stats.inboxHealthScore * 5.53} 553`}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                                initial={{ strokeDasharray: '0 553' }}
                                animate={{ strokeDasharray: `${stats.inboxHealthScore * 5.53} 553` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#0ea5e9" />
                                    <stop offset="100%" stopColor="#d946ef" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <motion.span
                                className="text-5xl font-bold gradient-text"
                                key={stats.inboxHealthScore}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {stats.inboxHealthScore}
                            </motion.span>
                            <span className="text-dark-500 text-sm mt-1">out of 100</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={Mail}
                        label="Emails Processed"
                        value={stats.emailsProcessed.toLocaleString()}
                        color="primary"
                    />
                    <StatCard
                        icon={Trash2}
                        label="Subscriptions Removed"
                        value={stats.subscriptionsRemoved}
                        color="danger"
                    />
                    <StatCard
                        icon={DollarSign}
                        label="Money Saved"
                        value={`$${stats.moneySaved}`}
                        color="success"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Noise Reduced"
                        value={`${stats.noiseReduced}%`}
                        color="accent"
                    />
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-display font-bold text-dark-50 mb-4">
                        Recent Activity
                    </h3>
                    <div className="space-y-3">
                        {mockActivity.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
                            >
                                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-dark-200">
                                        <span className="text-dark-400">{activity.action}</span>{' '}
                                        <span className="font-medium">{activity.sender}</span>
                                        {activity.amount && (
                                            <span className="text-green-400 ml-1">({activity.amount})</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-dark-500 mt-1">{activity.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Achievements */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-display font-bold text-dark-50 mb-4">
                        Achievements
                    </h3>
                    <div className="space-y-3">
                        {mockBadges.map((badge, index) => {
                            const icons = [Target, Zap, Award, Trash2];
                            const Icon = icons[index % icons.length];

                            return (
                                <motion.div
                                    key={badge.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${badge.unlocked
                                            ? 'bg-gradient-to-r from-primary-600/10 to-accent-600/10 border-primary-500/30'
                                            : 'bg-dark-800/30 border-dark-700 opacity-50'
                                        }`}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${badge.unlocked
                                                ? 'bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30'
                                                : 'bg-dark-700'
                                            }`}
                                    >
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-dark-200">{badge.name}</p>
                                        <p className="text-xs text-dark-500">
                                            {badge.unlocked ? 'Unlocked!' : 'Locked'}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    const colorClasses = {
        primary: 'from-primary-500 to-primary-600',
        danger: 'from-red-500 to-red-600',
        success: 'from-green-500 to-green-600',
        accent: 'from-accent-500 to-accent-600',
    };

    return (
        <motion.div
            className="stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="stat-label mb-1">{label}</p>
            <motion.p
                className="stat-value"
                key={value}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {value}
            </motion.p>
        </motion.div>
    );
}
