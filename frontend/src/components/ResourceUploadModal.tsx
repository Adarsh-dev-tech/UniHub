import React, { useState } from 'react';
import { ResourceType, FileUpload } from '../types';
import api from '../utils/api';
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface ResourceUploadModalProps {
  subjectId: string;
  onClose: () => void;
  onUpload: () => void;
}

const ResourceUploadModal: React.FC<ResourceUploadModalProps> = ({
  subjectId,
  onClose,
  onUpload
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Class Notes' as ResourceType | 'Custom',
    customType: '',
    yearOfPaper: new Date().getFullYear(),
    tags: '',
    description: '',
    externalURL: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const resourceTypes: (ResourceType | 'Custom')[] = [
    'Course Plan',
    'CT Paper',
    'End Sem Paper',
    'PPT',
    'Class Notes',
    'Reference Book',
    'YouTube Link',
    'Custom'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearOfPaper' ? parseInt(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    if (selectedFile && !formData.title) {
      // Auto-fill title with filename (without extension)
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({ ...prev, title: nameWithoutExt }));
    }
  };

  const uploadFile = async (file: File): Promise<FileUpload> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      },
    });

    return response.data.file;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      if (formData.type === 'Custom' && !formData.customType.trim()) {
        throw new Error('Custom type is required');
      }

      if (formData.type === 'YouTube Link' && !formData.externalURL.trim()) {
        throw new Error('YouTube URL is required');
      }

      if (formData.type !== 'YouTube Link' && !file) {
        throw new Error('File is required for this resource type');
      }

      if (['CT Paper', 'End Sem Paper'].includes(formData.type) && !formData.yearOfPaper) {
        throw new Error('Year is required for exam papers');
      }

      let fileData: FileUpload | null = null;

      // Upload file if provided
      if (file) {
        fileData = await uploadFile(file);
      }

      // Create resource
      const resourceData = {
        title: formData.title.trim(),
        type: formData.type,
        customType: formData.type === 'Custom' ? formData.customType.trim() : undefined,
        subject: subjectId,
        yearOfPaper: ['CT Paper', 'End Sem Paper'].includes(formData.type) ? formData.yearOfPaper : undefined,
        tags: formData.tags.trim(),
        description: formData.description.trim(),
        externalURL: formData.type === 'YouTube Link' ? formData.externalURL.trim() : undefined,
        ...(fileData && {
          fileURL: fileData.fileURL,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          fileType: fileData.fileType
        })
      };

      await api.post('/resources', resourceData);
      
      onUpload();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const isYouTubeLink = formData.type === 'YouTube Link';
  const isExamPaper = ['CT Paper', 'End Sem Paper'].includes(formData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload Resource
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading && uploadProgress > 0 && (
          <div className="mx-6 mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Uploading... {uploadProgress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter resource title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Resource Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {resourceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {formData.type === 'Custom' && (
              <div>
                <label htmlFor="customType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom Type *
                </label>
                <input
                  type="text"
                  id="customType"
                  name="customType"
                  value={formData.customType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter custom type"
                />
              </div>
            )}

            {isExamPaper && (
              <div>
                <label htmlFor="yearOfPaper" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year *
                </label>
                <select
                  id="yearOfPaper"
                  name="yearOfPaper"
                  value={formData.yearOfPaper}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isYouTubeLink ? (
            <div>
              <label htmlFor="externalURL" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                YouTube URL *
              </label>
              <input
                type="url"
                id="externalURL"
                name="externalURL"
                value={formData.externalURL}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          ) : (
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                File *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
                <div className="space-y-1 text-center">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file"
                      className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file"
                        name="file"
                        type="file"
                        onChange={handleFileChange}
                        className="sr-only"
                        accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, PPT, DOC, TXT, or image files up to 50MB
                  </p>
                  {file && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., important, midterm, chapter-1"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Optional description of the resource"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
            >
              {loading ? 'Uploading...' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceUploadModal;