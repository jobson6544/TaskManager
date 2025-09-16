'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import { 
  UserIcon, 
  EnvelopeIcon, 
  KeyIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const router = useRouter();
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error, 
    updateProfile, 
    changePassword, 
    deleteAccount, 
    logout,
    clearError 
  } = useAuthStore();

  // Profile update state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // UI state
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({ name, email });
    if (success) {
      setIsEditingProfile(false);
      showSuccessMessage('Profile updated successfully!');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 6) {
      return;
    }

    const success = await changePassword({ currentPassword, newPassword });
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      showSuccessMessage('Password changed successfully!');
    }
  };

  const handleDeleteAccount = async () => {
    const success = await deleteAccount();
    if (success) {
      router.push('/login');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto dark:bg-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 mr-3 text-blue-600 dark:text-gray-400" />
            <h1 className="text-3xl font-bold">Profile Settings</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-700">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-lg border border-green-200 dark:border-green-700">
            {successMessage}
          </div>
        )}

        <div className="space-y-8">
          {/* Account Overview */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-gray-400" />
              <h2 className="text-xl font-semibold">Account Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {user.profilePictureUrl ? (
                    <img 
                      src={user.profilePictureUrl} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-blue-600 dark:text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <h3 className="font-medium mb-3">Account Status</h3>
                <div className="flex items-center space-x-2">
                  {user.hasPassword ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                  <span className="text-sm">Password Login</span>
                </div>
                <div className="flex items-center space-x-2">
                  {user.hasGoogleLogin ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                  <span className="text-sm">Google Login</span>
                </div>
                {user.hasPassword && user.hasGoogleLogin && (
                  <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <LinkIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Accounts Linked - You can sign in with either method</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Profile Information */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-green-500 dark:text-gray-400" />
                <h2 className="text-xl font-semibold">Profile Information</h2>
              </div>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-gray-200 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 text-sm"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setName(user.name);
                      setEmail(user.email);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                  <p className="text-lg">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
              </div>
            )}
          </section>

          {/* Password Management */}
          {user.hasPassword && (
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <KeyIcon className="h-5 w-5 mr-2 text-orange-500 dark:text-gray-400" />
                  <h2 className="text-xl font-semibold">Password</h2>
                </div>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-2 bg-orange-100 dark:bg-gray-700 text-orange-700 dark:text-gray-200 rounded-lg hover:bg-orange-200 dark:hover:bg-gray-600 text-sm"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-gray-500 dark:text-gray-400"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-gray-500 dark:text-gray-400"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-gray-500 dark:text-gray-400"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  {newPassword !== confirmPassword && confirmPassword && (
                    <p className="text-red-600 dark:text-red-400 text-sm">Passwords do not match</p>
                  )}
                  {newPassword && newPassword.length < 6 && (
                    <p className="text-red-600 dark:text-red-400 text-sm">Password must be at least 6 characters</p>
                  )}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Password last changed recently. Click "Change Password" to update it.
                </p>
              )}
            </section>
          )}

          {/* Danger Zone */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <TrashIcon className="h-5 w-5 mr-2 text-red-500 dark:text-gray-400" />
              <h2 className="text-xl font-semibold">Danger Zone</h2>
            </div>

            <div className="bg-red-50 dark:bg-gray-700 border border-red-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-gray-400 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-800 dark:text-gray-200 mb-2">
                    Delete Account
                  </h3>
                  <p className="text-red-700 dark:text-gray-300 text-sm mb-3">
                    This will permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  
                  {showDeleteConfirm ? (
                    <div className="space-y-3">
                      <p className="text-red-800 dark:text-gray-200 font-medium">
                        Are you absolutely sure? This will delete everything.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                        >
                          {loading ? 'Deleting...' : 'Yes, delete my account'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center px-4 py-2 bg-red-100 dark:bg-gray-600 text-red-700 dark:text-gray-200 rounded-lg hover:bg-red-200 dark:hover:bg-gray-500 text-sm font-medium"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ProfilePage;