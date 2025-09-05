import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import api from '../utils/api';
import { 
  UserIcon, 
  AcademicCapIcon, 
  DocumentIcon,
  ChartBarIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  // const [userResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalDownloads: 0,
    resourcesByType: []
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    profile: {
      branch: '',
      year: 1,
      semester: 1,
      section: ''
    }
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch detailed profile
      const profileResponse = await api.get('/users/profile');
      setProfile(profileResponse.data);
      setEditData({
        name: profileResponse.data.name,
        profile: profileResponse.data.profile || {
          branch: '',
          year: 1,
          semester: 1,
          section: ''
        }
      });

      // Fetch user stats
      const statsResponse = await api.get(`/users/${profileResponse.data.id}/stats`);
      setStats(statsResponse.data);

      // If user has uploaded resources, fetch them
      if (profileResponse.data.uploadedResources?.length > 0) {
        // This would need an endpoint to fetch user's resources
        // For now, we'll use a placeholder
        // setUserResources([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.put('/users/profile', editData);
      setProfile(prev => prev ? { ...prev, ...editData } : null);
      setEditMode(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Profile not found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                  {profile.profile && (
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <AcademicCapIcon className="h-4 w-4 mr-1" />
                        {profile.profile.branch}
                      </span>
                      <span>Year {profile.profile.year}</span>
                      <span>Semester {profile.profile.semester}</span>
                      <span>Section {profile.profile.section}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <DocumentIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Resources Uploaded
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUploads}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Downloads
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalDownloads}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Contribution Score
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((stats.totalUploads * 10) + (stats.totalDownloads * 0.1))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Breakdown */}
        {stats.resourcesByType.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Resources by Type
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.resourcesByType.map((item: any) => (
                  <div key={item._id} className="text-center">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {item.count}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item._id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Account Information
            </h2>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Member Since
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(profile.createdAt || '').toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Profile Status
                </dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.isSetupComplete 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {profile.isSetupComplete ? 'Complete' : 'Incomplete'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {editMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Edit Profile
              </h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={editData.profile.branch}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      profile: { ...prev.profile, branch: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year
                    </label>
                    <select
                      value={editData.profile.year}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        profile: { ...prev.profile, year: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {[1, 2, 3, 4, 5, 6].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Semester
                    </label>
                    <select
                      value={editData.profile.semester}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        profile: { ...prev.profile, semester: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    value={editData.profile.section}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      profile: { ...prev.profile, section: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;