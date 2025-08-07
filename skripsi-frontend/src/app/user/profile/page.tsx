'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  AcademicCapIcon,
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  noHp: string;
  nik: string;
  isMahasiswa: boolean;
  isAdmin: boolean;
  pj: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const { user: authUser, updateUser: updateAuthUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isUpdateSupported, setIsUpdateSupported] = useState(false); // Disable updates for now
  const [formData, setFormData] = useState({
    fullName: '',
    noHp: '',
    nik: '',
    pj: ''
  });

  useEffect(() => {
    if (!authUser) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [authUser, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userApi.getProfile();
      const userData = response.data.data;
      setProfile(userData);
      setFormData({
        fullName: userData.fullName || '',
        noHp: userData.noHp || '',
        nik: userData.nik || '',
        pj: userData.pj || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit, reset form
      if (profile) {
        setFormData({
          fullName: profile.fullName || '',
          noHp: profile.noHp || '',
          nik: profile.nik || '',
          pj: profile.pj || ''
        });
      }
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      let response;
      try {
        // First try to update profile via /users/profile endpoint
        response = await userApi.updateProfile(formData);
      } catch (firstError) {
        console.log('Profile endpoint failed, trying user ID endpoint...');
        // If that fails, try to update via /users/{id} endpoint
        try {
          response = await userApi.updateProfileById(profile.id, formData);
        } catch (secondError) {
          // If that also fails, try the original updateUser method with PATCH
          response = await userApi.updateUser(profile.id, formData);
        }
      }
      
      const updatedUser = response.data.data;
      
      setProfile(updatedUser);
      updateAuthUser(updatedUser);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Check if it's a permission error
      if ((error as any)?.response?.status === 403) {
        toast.error('You do not have permission to update this profile');
      } else if ((error as any)?.response?.status === 404) {
        toast.error('Profile update endpoint not found. Please contact support.');
      } else {
        toast.error('Failed to update profile');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Profile not found</h3>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">View your account information</p>
          </div>
          {isUpdateSupported && (
            <button
              onClick={editMode ? handleSaveProfile : handleEditToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                editMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {editMode ? (
                <>
                  <CheckIcon className="h-5 w-5" />
                  Save Changes
                </>
              ) : (
                <>
                  <PencilIcon className="h-5 w-5" />
                  Edit Profile
                </>
              )}
            </button>
          )}
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {profile.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex gap-3 mt-2">
                {profile.isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Admin
                  </span>
                )}
                {profile.isMahasiswa && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Mahasiswa
                  </span>
                )}
                {!profile.isAdmin && !profile.isMahasiswa && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Regular User
                  </span>
                )}
              </div>
            </div>
            {editMode && (
              <button
                onClick={handleEditToggle}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Notice for profile updates */}
        {!isUpdateSupported && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  Profile editing is currently view-only. To update your information, please contact the administrator.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 text-gray-400" />
                Full Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                Email Address
              </label>
              <p className="text-gray-900">{profile.email}</p>
              {editMode && (
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="h-4 w-4 text-gray-400" />
                Phone Number
              </label>
              {editMode ? (
                <input
                  type="tel"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+62xxx"
                />
              ) : (
                <p className="text-gray-900">{profile.noHp || '-'}</p>
              )}
            </div>

            {/* NIK */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <IdentificationIcon className="h-4 w-4 text-gray-400" />
                NIK
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter NIK"
                />
              ) : (
                <p className="text-gray-900">{profile.nik || '-'}</p>
              )}
            </div>

            {/* Person in Charge */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <UserCircleIcon className="h-4 w-4 text-gray-400" />
                Person in Charge (PJ)
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.pj}
                  onChange={(e) => setFormData({ ...formData, pj: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter person in charge"
                />
              ) : (
                <p className="text-gray-900">{profile.pj || '-'}</p>
              )}
            </div>

            {/* Student Status */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                Student Status
              </label>
              <p className="text-gray-900">
                {profile.isMahasiswa ? 'Student' : 'Non-Student'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Account Type
              </label>
              <p className="text-gray-900">
                {profile.isAdmin ? 'Administrator' : 'Regular User'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                User ID
              </label>
              <p className="text-gray-900">#{profile.id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Member Since
              </label>
              <p className="text-gray-900">{formatDate(profile.createdAt)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Last Updated
              </label>
              <p className="text-gray-900">{formatDate(profile.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Security</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">Last changed: Never</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
