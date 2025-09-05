import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';
import { resourceService, UploadResourceData } from '../services/resources';
import toast from 'react-hot-toast';

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectCode: string;
  onUploadSuccess: () => void;
}

const resourceTypes = [
  'Course Plan',
  'CT Paper', 
  'End Sem Paper',
  'PPT',
  'Class Notes',
  'Reference Book',
  'YouTube Link',
  'Custom'
];

const UploadResourceModal: React.FC<UploadResourceModalProps> = ({
  isOpen,
  onClose,
  subjectCode,
  onUploadSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    customType: '',
    yearOfPaper: '',
    tags: '',
    externalURL: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.type === 'YouTube Link' && !formData.externalURL) {
      toast.error('Please provide a YouTube URL');
      return;
    }

    if (formData.type !== 'YouTube Link' && !file) {
      toast.error('Please select a file to upload');
      return;
    }

    if ((formData.type === 'CT Paper' || formData.type === 'End Sem Paper') && !formData.yearOfPaper) {
      toast.error('Year is required for exam papers');
      return;
    }

    setLoading(true);
    try {
      const uploadData: UploadResourceData = {
        title: formData.title,
        type: formData.type,
        subjectCode,
        tags: formData.tags,
      };

      if (formData.type === 'Custom' && formData.customType) {
        uploadData.customType = formData.customType;
      }

      if (formData.yearOfPaper) {
        uploadData.yearOfPaper = parseInt(formData.yearOfPaper);
      }

      if (formData.type === 'YouTube Link') {
        uploadData.externalURL = formData.externalURL;
      } else if (file) {
        uploadData.file = file;
      }

      await resourceService.uploadResource(uploadData);
      toast.success('Resource uploaded successfully!');
      onUploadSuccess();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        type: '',
        customType: '',
        yearOfPaper: '',
        tags: '',
        externalURL: '',
      });
      setFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload resource');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isYouTubeLink = formData.type === 'YouTube Link';
  const requiresYear = formData.type === 'CT Paper' || formData.type === 'End Sem Paper';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload Resource
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter resource title"
              required
            />
          </div>

          {/* Resource Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resource Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select type</option>
              {resourceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Custom Type */}
          {formData.type === 'Custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custom Type *
              </label>
              <input
                type="text"
                name="customType"
                value={formData.customType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter custom type"
                required
              />
            </div>
          )}

          {/* Year of Paper */}
          {requiresYear && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year *
              </label>
              <input
                type="number"
                name="yearOfPaper"
                value={formData.yearOfPaper}
                onChange={handleChange}
                min="2000"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="2024"
                required
              />
            </div>
          )}

          {/* File Upload or URL */}
          {isYouTubeLink ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                YouTube URL *
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="url"
                  name="externalURL"
                  value={formData.externalURL}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://youtube.com/..."
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                File *
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-primary-600 hover:text-primary-700"
                >
                  Choose file
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PDF, DOC, PPT, TXT, or image files (max 50MB)
                </p>
                {file && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (optional)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="exam, important, chapter1 (comma separated)"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                       bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                       rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 
                       rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                'Upload Resource'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadResourceModal;