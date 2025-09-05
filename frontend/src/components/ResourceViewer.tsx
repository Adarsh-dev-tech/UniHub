import React, { useState, useEffect } from 'react';
import { Resource, Rating } from '../types';
import api from '../utils/api';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon, 
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ResourceViewerProps {
  resource: Resource;
  onClose: () => void;
  onDownload: () => void;
}

const ResourceViewer: React.FC<ResourceViewerProps> = ({ resource, onClose, onDownload }) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [newRating, setNewRating] = useState({ value: 5, comment: '' });
  // const [loading] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchRatings();
    fetchUserRating();
  }, [resource._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRatings = async () => {
    try {
      const response = await api.get(`/ratings/resource/${resource._id}`);
      setRatings(response.data);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    }
  };

  const fetchUserRating = async () => {
    try {
      const response = await api.get(`/ratings/user/${resource._id}`);
      setUserRating(response.data);
      if (response.data) {
        setNewRating({ value: response.data.value, comment: response.data.comment || '' });
      }
    } catch (error) {
      console.error('Failed to fetch user rating:', error);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRating(true);

    try {
      const response = await api.post('/ratings', {
        resource: resource._id,
        value: newRating.value,
        comment: newRating.comment
      });

      setUserRating(response.data.rating);
      fetchRatings(); // Refresh all ratings
    } catch (error: any) {
      console.error('Failed to submit rating:', error);
      alert(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderFileViewer = () => {
    if (resource.type === 'YouTube Link' && resource.externalURL) {
      // Extract YouTube video ID and create embed URL
      const videoId = extractYouTubeVideoId(resource.externalURL);
      if (videoId) {
        return (
          <iframe
            className="w-full h-96 rounded-lg"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={resource.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    if (resource.fileURL) {
      const fileExtension = resource.fileName?.split('.').pop()?.toLowerCase();
      const fileUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '')}/api/upload/view/${resource.fileURL.split('/').pop()}`;

      if (fileExtension === 'pdf') {
        return (
          <iframe
            className="w-full h-96 rounded-lg border"
            src={fileUrl}
            title={resource.title}
          />
        );
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
        return (
          <img
            className="w-full h-auto max-h-96 object-contain rounded-lg border"
            src={fileUrl}
            alt={resource.title}
          />
        );
      } else {
        return (
          <div className="w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg border flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📄</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Preview not available for this file type
              </p>
              <button
                onClick={onDownload}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download to View
              </button>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg border flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">No preview available</p>
      </div>
    );
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const uploader = typeof resource.uploader === 'object' ? resource.uploader : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {resource.title}
            </h2>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Uploaded by {uploader?.name || 'Unknown'}</span>
              <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                {resource.views} views
              </div>
              <div className="flex items-center">
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                {resource.downloads} downloads
              </div>
            </div>
            {resource.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {resource.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {resource.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {resource.description}
              </p>
            )}
          </div>
          
          <div className="ml-4 flex space-x-2">
            <button
              onClick={onDownload}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* File Viewer */}
        <div className="p-6">
          {renderFileViewer()}
        </div>

        {/* Rating Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Rating & Comments
          </h3>

          {/* Overall Rating */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIconSolid
                  key={star}
                  className={`h-6 w-6 ${
                    star <= Math.round(resource.averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {resource.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({resource.totalRatings} {resource.totalRatings === 1 ? 'rating' : 'ratings'})
            </span>
          </div>

          {/* User Rating Form */}
          <form onSubmit={handleRatingSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
              {userRating ? 'Update Your Rating' : 'Rate This Resource'}
            </h4>
            
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(prev => ({ ...prev, value: star }))}
                  className="focus:outline-none"
                >
                  <StarIcon
                    className={`h-6 w-6 ${
                      star <= newRating.value
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                {newRating.value}/5
              </span>
            </div>

            <textarea
              value={newRating.comment}
              onChange={(e) => setNewRating(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Write a comment (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:text-white"
            />

            <button
              type="submit"
              disabled={submittingRating}
              className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
            >
              {submittingRating ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Comments ({ratings.length})
            </h4>
            
            {ratings.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              ratings.map((rating) => {
                const ratingUser = typeof rating.user === 'object' ? rating.user : null;
                return (
                  <div key={rating._id} className="border-b border-gray-200 dark:border-gray-600 pb-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                            {ratingUser?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {ratingUser?.name || 'Anonymous'}
                          </p>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIconSolid
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= rating.value ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {rating.comment && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {rating.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceViewer;