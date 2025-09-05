import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Subject, Resource, DiscussionPost } from '../types';
import api from '../utils/api';
import { 
  DocumentIcon, 
  PresentationChartLineIcon,
  BookOpenIcon,
  VideoCameraIcon,
  CloudArrowUpIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import ResourceUploadModal from '../components/ResourceUploadModal';
import ResourceViewer from '../components/ResourceViewer';
import DiscussionSection from '../components/DiscussionSection';

const SubjectPage: React.FC = () => {
  const { subjectCode } = useParams<{ subjectCode: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<Record<string, any>>({});
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    if (subjectCode) {
      fetchSubjectData();
    }
  }, [subjectCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSubjectData = async () => {
    try {
      setLoading(true);
      
      // Fetch subject details
      const subjectResponse = await api.get(`/subjects/${subjectCode}`);
      setSubject(subjectResponse.data);

      // Fetch resources for this subject
      const resourcesResponse = await api.get(`/resources/subject/${subjectResponse.data._id}`);
      setResources(resourcesResponse.data);

      // Fetch discussions for this subject
      const discussionsResponse = await api.get(`/discussions/subject/${subjectResponse.data._id}`);
      setDiscussions(discussionsResponse.data.discussions || []);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subject data');
      if (err.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResourceUpload = () => {
    setShowUploadModal(false);
    fetchSubjectData(); // Refresh data after upload
  };

  const handleResourceView = (resource: Resource) => {
    setSelectedResource(resource);
    // Increment view count
    api.put(`/resources/${resource._id}`, { action: 'view' });
  };

  const handleResourceDownload = async (resource: Resource) => {
    try {
      await api.put(`/resources/${resource._id}/download`);
      // Open download link
      if (resource.fileURL) {
        window.open(`${process.env.REACT_APP_API_URL?.replace('/api', '')}${resource.fileURL}`, '_blank');
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!subject) {
    return <LoadingSpinner />;
  }

  const resourceTypes = [
    { key: 'Course Plan', icon: DocumentIcon, color: 'text-blue-600' },
    { key: 'CT Paper', icon: DocumentIcon, color: 'text-red-600' },
    { key: 'End Sem Paper', icon: DocumentIcon, color: 'text-purple-600' },
    { key: 'PPT', icon: PresentationChartLineIcon, color: 'text-orange-600' },
    { key: 'Class Notes', icon: BookOpenIcon, color: 'text-green-600' },
    { key: 'Reference Book', icon: BookOpenIcon, color: 'text-indigo-600' },
    { key: 'YouTube Link', icon: VideoCameraIcon, color: 'text-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subject Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {subject.subjectName}
              </h1>
              <div className="mt-2 flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium">
                  {subject.subjectCode}
                </span>
                {subject.professorName && (
                  <span>Prof. {subject.professorName}</span>
                )}
                <span>Year {subject.year} • Semester {subject.semester}</span>
              </div>
              {subject.description && (
                <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-3xl">
                  {subject.description}
                </p>
              )}
            </div>
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Upload Resource
            </button>
          </div>
        </div>

        {/* Resources Section */}
        <div className="space-y-8">
          {resourceTypes.map(({ key, icon: Icon, color }) => (
            <ResourceSection
              key={key}
              title={key}
              icon={Icon}
              iconColor={color}
              resources={resources[key] || (key === 'CT Paper' || key === 'End Sem Paper' ? {} : [])}
              onResourceView={handleResourceView}
              onResourceDownload={handleResourceDownload}
              isExamPaper={key === 'CT Paper' || key === 'End Sem Paper'}
            />
          ))}

          {/* Custom Resource Types */}
          {Object.keys(resources).map(type => {
            if (!resourceTypes.find(rt => rt.key === type)) {
              return (
                <ResourceSection
                  key={type}
                  title={type}
                  icon={DocumentIcon}
                  iconColor="text-gray-600"
                  resources={resources[type] || []}
                  onResourceView={handleResourceView}
                  onResourceDownload={handleResourceDownload}
                  isCustom
                />
              );
            }
            return null;
          })}
        </div>

        {/* Discussion Section */}
        <div className="mt-12">
          <div className="flex items-center mb-6">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Discussion & Q&A
            </h2>
          </div>
          <DiscussionSection 
            subjectId={subject._id} 
            discussions={discussions}
            onUpdate={fetchSubjectData}
          />
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <ResourceUploadModal
          subjectId={subject._id}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleResourceUpload}
        />
      )}

      {selectedResource && (
        <ResourceViewer
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onDownload={() => handleResourceDownload(selectedResource)}
        />
      )}
    </div>
  );
};

interface ResourceSectionProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  resources: Resource[] | Record<string, Resource[]>;
  onResourceView: (resource: Resource) => void;
  onResourceDownload: (resource: Resource) => void;
  isExamPaper?: boolean;
  isCustom?: boolean;
}

const ResourceSection: React.FC<ResourceSectionProps> = ({
  title,
  icon: Icon,
  iconColor,
  resources,
  onResourceView,
  onResourceDownload,
  isExamPaper = false,
  isCustom = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const renderResources = (resourceList: Resource[]) => (
    <div className="grid gap-4">
      {resourceList.map((resource) => (
        <ResourceCard
          key={resource._id}
          resource={resource}
          onView={() => onResourceView(resource)}
          onDownload={() => onResourceDownload(resource)}
        />
      ))}
    </div>
  );

  const renderExamPapers = (papersByYear: Record<string, Resource[]>) => (
    <div className="space-y-6">
      {Object.entries(papersByYear)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([year, papers]) => (
          <div key={year}>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {year}
            </h4>
            {renderResources(papers)}
          </div>
        ))}
    </div>
  );

  const resourceCount = isExamPaper 
    ? Object.values(resources as Record<string, Resource[]>).flat().length
    : (resources as Resource[]).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div 
        className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className={`h-5 w-5 ${iconColor} mr-3`} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
              {isCustom && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Custom</span>}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {resourceCount} {resourceCount === 1 ? 'resource' : 'resources'}
            </span>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg 
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          {resourceCount === 0 ? (
            <div className="text-center py-8">
              <Icon className={`mx-auto h-12 w-12 ${iconColor} opacity-50`} />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No {title.toLowerCase()} available yet
              </p>
            </div>
          ) : isExamPaper ? (
            renderExamPapers(resources as Record<string, Resource[]>)
          ) : (
            renderResources(resources as Resource[])
          )}
        </div>
      )}
    </div>
  );
};

interface ResourceCardProps {
  resource: Resource;
  onView: () => void;
  onDownload: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onView, onDownload }) => {
  const uploader = typeof resource.uploader === 'object' ? resource.uploader : null;

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {resource.title}
          </h4>
          <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Uploaded by {uploader?.name || 'Unknown'}</span>
            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
            <div className="flex items-center">
              <EyeIcon className="h-3 w-3 mr-1" />
              {resource.views}
            </div>
            <div className="flex items-center">
              <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
              {resource.downloads}
            </div>
          </div>
          {resource.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {resource.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(resource.averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {resource.averageRating.toFixed(1)} ({resource.totalRatings} {resource.totalRatings === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        </div>
        
        <div className="ml-4 flex space-x-2">
          <button
            onClick={onView}
            className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            View
          </button>
          <button
            onClick={onDownload}
            className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectPage;