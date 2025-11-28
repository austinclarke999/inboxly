import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Subscriptions from './pages/Subscriptions';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      {/* Legacy redirect */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}

export default App;

