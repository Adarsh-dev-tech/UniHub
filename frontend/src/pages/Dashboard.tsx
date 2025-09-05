import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Subject } from '../types';
import api from '../utils/api';
import { 
  BookOpenIcon, 
  UserIcon, 
  ChartBarIcon,
  PlusCircleIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user?.isSetupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Your Profile Setup
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please complete your profile setup to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Welcome, {user?.name}!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Example card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition hover:shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Your Subjects
            </h2>
            {/* ...subject list... */}
          </div>
          {/* Add more cards for Announcements, Resources, etc. */}
        </div>
      </div>
    </div>
  );
};

interface SubjectCardProps {
  subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  return (
    <Link
      to={`/subjects/${subject.subjectCode}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <BookOpenIcon className="h-8 w-8 text-primary-600" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {subject.subjectCode}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {subject.subjectName}
        </h3>
        
        {subject.professorName && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Prof. {subject.professorName}
          </p>
        )}
        
        {subject.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {subject.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Year {subject.year} • Sem {subject.semester}</span>
          {subject.credits && <span>{subject.credits} Credits</span>}
        </div>
      </div>
    </Link>
  );
};

export default Dashboard;