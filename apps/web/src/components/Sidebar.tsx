import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Inbox,
    CreditCard,
    Settings,
    Sparkles,
    Mail
} from 'lucide-react';

const navItems = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/app/inbox', icon: Inbox, label: 'Inbox' },
    { to: '/app/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-dark-900/50 backdrop-blur-xl border-r border-dark-800 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-dark-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-display font-bold gradient-text">Inboxly</h1>
                        <p className="text-xs text-dark-500">AI Email Assistant</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-primary-600/20 to-accent-600/20 text-primary-300 border border-primary-500/30 shadow-lg shadow-primary-500/10'
                                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* AI Status */}
            <div className="p-4 border-t border-dark-800">
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-dark-200">Gemini AI</p>
                            <p className="text-xs text-green-400">Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
