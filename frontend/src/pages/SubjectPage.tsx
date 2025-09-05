import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import UploadResourceModal from '../components/UploadResourceModal';
import { subjectService } from '../services/subjects';
import { resourceService } from '../services/resources';
import { Subject, Resource } from '../types';
import { 
  BookOpen, 
  Upload, 
  Download, 
  Star, 
  Eye, 
  Calendar,
  FileText,
  Video,
  Users,
  MessageSquare,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const resourceTypeIcons: Record<string, React.ReactNode> = {
  'Course Plan': <BookOpen className="h-5 w-5" />,
  'CT Paper': <FileText className="h-5 w-5" />,
  'End Sem Paper': <FileText className="h-5 w-5" />,
  'PPT': <FileText className="h-5 w-5" />,
  'Class Notes': <FileText className="h-5 w-5" />,
  'Reference Book': <BookOpen className="h-5 w-5" />,
  'YouTube Link': <Video className="h-5 w-5" />,
};

const SubjectPage: React.FC = () => {
  const { subjectCode } = useParams<{ subjectCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<Record<string, Resource[]>>({});
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (subjectCode) {
      fetchSubjectData();
    }
  }, [subjectCode]);

  const fetchSubjectData = async () => {
    if (!subjectCode) return;
    
    try {
      setLoading(true);
      const [subjectData, resourcesData] = await Promise.all([
        subjectService.getSubjectByCode(subjectCode),
        resourceService.getResourcesBySubject(subjectCode)
      ]);
      
      setSubject(subjectData);
      setResources(resourcesData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch subject data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchSubjectData(); // Refresh resources after upload
  };

  const handleDownload = async (resourceId: string) => {
    try {
      await resourceService.downloadResource(resourceId);
      toast.success('Download started');
    } catch (error: any) {
      toast.error('Failed to download resource');
    }
  };

  const renderResourceCard = (resource: Resource) => (
    <div
      key={resource._id}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
          {resource.title}
        </h4>
        {resourceTypeIcons[resource.customType || resource.type] || <FileText className="h-5 w-5" />}
      </div>
      
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        By {resource.uploader.name}
        {resource.yearOfPaper && ` • ${resource.yearOfPaper}`}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            <Star className="h-3 w-3 mr-1" />
            {resource.averageRating.toFixed(1)} ({resource.totalRatings})
          </span>
          <span className="flex items-center">
            <Download className="h-3 w-3 mr-1" />
            {resource.downloads}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              // TODO: Implement preview modal
              toast('Preview functionality coming soon!');
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDownload(resource._id)}
            className="p-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {resource.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
            >
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{resource.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );

  const renderResourceSection = (type: string, resources: Resource[]) => {
    if (resources.length === 0) return null;

    // Group exam papers by year
    if (type === 'CT Paper' || type === 'End Sem Paper') {
      const groupedByYear = resources.reduce((acc, resource) => {
        const year = resource.yearOfPaper || 'Unknown';
        if (!acc[year]) acc[year] = [];
        acc[year].push(resource);
        return acc;
      }, {} as Record<string, Resource[]>);

      return (
        <div key={type} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            {resourceTypeIcons[type]}
            <span className="ml-2">{type}s</span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({resources.length})
            </span>
          </h3>
          
          {Object.entries(groupedByYear)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, yearResources]) => (
              <div key={year} className="mb-4">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {year}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {yearResources.map(renderResourceCard)}
                </div>
              </div>
            ))}
        </div>
      );
    }

    return (
      <div key={type} className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          {resourceTypeIcons[type]}
          <span className="ml-2">{type}</span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            ({resources.length})
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(renderResourceCard)}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Subject Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The subject you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subject Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {subject.subjectName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
                {subject.subjectCode}
              </p>
              {subject.professorName && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Professor: {subject.professorName}
                </p>
              )}
            </div>
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resource
            </button>
          </div>
        </div>

        {/* Resources Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Resources
          </h2>
          
          {Object.keys(resources).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No resources yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Be the first to upload a resource for this subject!
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center mx-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload First Resource
              </button>
            </div>
          ) : (
            <div>
              {Object.entries(resources).map(([type, typeResources]) =>
                renderResourceSection(type, typeResources)
              )}
            </div>
          )}
        </div>

        {/* Discussion Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Discussion & Q&A
            </h2>
            <button className="flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4 mr-1" />
              New Post
            </button>
          </div>
          
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Discussion features coming soon! This will be a place for students to ask questions and share knowledge.
            </p>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadResourceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        subjectCode={subjectCode || ''}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default SubjectPage;