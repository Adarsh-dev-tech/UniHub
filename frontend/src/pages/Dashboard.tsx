import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import ProfileSetupModal from '../components/ProfileSetupModal';
import api from '../services/api';
import { Subject } from '../types';
import { BookOpen, Users, Star, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (user && !user.isProfileComplete) {
      setShowProfileModal(true);
    }
  }, [user]);

  useEffect(() => {
    if (user?.isProfileComplete) {
      fetchSubjects();
    }
  }, [user?.isProfileComplete]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subjects/my-subjects');
      setSubjects(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = () => {
    setShowProfileModal(false);
    fetchSubjects();
  };

  if (!user?.isProfileComplete) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to UniHub!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please complete your profile to get started
            </p>
            <button
              onClick={() => setShowProfileModal(true)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Complete Profile
            </button>
          </div>
        </div>
        <ProfileSetupModal
          isOpen={showProfileModal}
          onClose={handleProfileComplete}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.profile && (
              <>
                {user.profile.branch} • Year {user.profile.year} • Semester {user.profile.semester} • Section {user.profile.section}
              </>
            )}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  My Subjects
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {subjects.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Resources Uploaded
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {user?.uploadedResources?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Rating
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  4.5
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Current Semester
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {user?.profile?.semester}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Subjects
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No subjects found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No subjects are available for your current academic configuration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md 
                           transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                  onClick={() => {
                    // TODO: Navigate to subject page
                    toast(`Subject page for ${subject.subjectCode} coming soon!`);
                  }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {subject.subjectName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {subject.subjectCode}
                  </p>
                  {subject.professorName && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Prof. {subject.professorName}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                      Year {subject.year} • Sem {subject.semester}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Click to explore →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ProfileSetupModal
        isOpen={showProfileModal}
        onClose={handleProfileComplete}
      />
    </div>
  );
};

export default Dashboard;