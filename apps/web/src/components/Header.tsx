import { Bell, Search, User } from 'lucide-react';
import { mockUser } from '../lib/mockData';

export default function Header() {
    return (
        <header className="h-16 bg-dark-900/30 backdrop-blur-xl border-b border-dark-800 flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                    <input
                        type="text"
                        placeholder="Search emails, subscriptions..."
                        className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-xl text-dark-200 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 ml-6">
                {/* Notifications */}
                <button className="relative p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <button className="flex items-center gap-3 p-2 hover:bg-dark-800 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-medium text-dark-200">{mockUser.name}</p>
                        <p className="text-xs text-dark-500">{mockUser.email}</p>
                    </div>
                </button>
            </div>
        </header>
    );
}
