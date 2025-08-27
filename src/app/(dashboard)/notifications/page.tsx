'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, AlertCircle, CheckCircle, Clock, Trash2, RefreshCw } from 'lucide-react';

interface Notification {
  id: string;
  type: 'trade' | 'signal' | 'risk' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  channel: 'email' | 'telegram' | 'discord' | 'internal';
}

interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  weekly: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'trade',
      title: 'Trade Executed',
      message: 'Successfully bought 1000 BONK at $0.000023',
      timestamp: '2024-01-15T10:30:00Z',
      read: false,
      priority: 'medium',
      channel: 'telegram'
    },
    {
      id: '2',
      type: 'signal',
      title: 'New Signal Detected',
      message: 'Strong buy signal for SOL - Confidence: 85%',
      timestamp: '2024-01-15T09:45:00Z',
      read: false,
      priority: 'high',
      channel: 'discord'
    },
    {
      id: '3',
      type: 'risk',
      title: 'Daily Risk Limit Warning',
      message: 'Daily risk has reached 80% of maximum limit',
      timestamp: '2024-01-15T08:15:00Z',
      read: true,
      priority: 'high',
      channel: 'email'
    },
    {
      id: '4',
      type: 'system',
      title: 'Trading Bot Started',
      message: 'Trading bot has been activated and is monitoring signals',
      timestamp: '2024-01-15T07:00:00Z',
      read: true,
      priority: 'low',
      channel: 'internal'
    },
    {
      id: '5',
      type: 'trade',
      title: 'Position Closed',
      message: 'Sold 500 RAY at $2.45 - Profit: +12.5%',
      timestamp: '2024-01-14T16:22:00Z',
      read: true,
      priority: 'medium',
      channel: 'telegram'
    }
  ]);

  const [stats, setStats] = useState<NotificationStats>({
    total: 45,
    unread: 12,
    today: 8,
    weekly: 34
  });

  const [filter, setFilter] = useState<'all' | 'unread' | 'trade' | 'signal' | 'risk' | 'system'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update stats
      const unreadCount = notifications.filter(n => !n.read).length;
      const todayCount = notifications.filter(n => {
        const today = new Date().toDateString();
        return new Date(n.timestamp).toDateString() === today;
      }).length;
      
      setStats(prev => ({
        ...prev,
        unread: unreadCount,
        today: todayCount
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trade': return '💰';
      case 'signal': return '📊';
      case 'risk': return '⚠️';
      case 'system': return '⚙️';
      default: return '📨';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'telegram': return <MessageSquare className="h-4 w-4" />;
      case 'discord': return <MessageSquare className="h-4 w-4" />;
      case 'internal': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-800/30 p-6">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-blue-300">Stay updated with your trading activities</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unread</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.unread}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Today</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.today}</p>
            </div>
            <Clock className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">This Week</p>
              <p className="text-2xl font-bold text-purple-400">{stats.weekly}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex flex-wrap gap-2">
            {(['all', 'unread', 'trade', 'signal', 'risk', 'system'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === filterType
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Mark All Read
            </button>
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Recent Notifications ({filteredNotifications.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-700">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'bg-gray-800/30' : 'bg-transparent'
                } hover:bg-gray-800/20 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xl">{getTypeIcon(notification.type)}</span>
                      <h3 className={`font-semibold ${
                        !notification.read ? 'text-white' : 'text-gray-300'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 mb-3">{notification.message}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        {getChannelIcon(notification.channel)}
                        <span className="capitalize">{notification.channel}</span>
                      </div>
                      <span>{formatTimestamp(notification.timestamp)}</span>
                      <span className={`capitalize px-2 py-1 rounded text-xs ${
                        notification.priority === 'high' ? 'bg-red-900/50 text-red-300' :
                        notification.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-green-900/50 text-green-300'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-emerald-400 hover:text-emerald-300 p-2"
                        title="Mark as read"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Delete notification"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
