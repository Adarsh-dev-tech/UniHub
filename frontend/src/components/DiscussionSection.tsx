import React, { useState } from 'react';
import { DiscussionPost } from '../types';
import api from '../utils/api';
import { 
  PlusIcon, 
  HandThumbUpIcon, 
  ChatBubbleLeftIcon, 
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DiscussionSectionProps {
  subjectId: string;
  discussions: DiscussionPost[];
  onUpdate: () => void;
}

const DiscussionSection: React.FC<DiscussionSectionProps> = ({ 
  subjectId, 
  discussions, 
  onUpdate 
}) => {
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [newReply, setNewReply] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/discussions', {
        subject: subjectId,
        title: newPost.title,
        content: newPost.content,
        tags: newPost.tags
      });

      setNewPost({ title: '', content: '', tags: '' });
      setShowNewPostForm(false);
      onUpdate();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      alert(error.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (postId: string, content: string) => {
    if (!content.trim()) return;

    try {
      await api.post(`/discussions/${postId}/reply`, { content });
      setNewReply(prev => ({ ...prev, [postId]: '' }));
      onUpdate();
    } catch (error: any) {
      console.error('Failed to reply:', error);
      alert(error.response?.data?.message || 'Failed to post reply');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.put(`/discussions/${postId}/like`);
      onUpdate();
    } catch (error: any) {
      console.error('Failed to like post:', error);
    }
  };

  const handleReplyLike = async (postId: string, replyId: string) => {
    try {
      await api.put(`/discussions/${postId}/reply/${replyId}/like`);
      onUpdate();
    } catch (error: any) {
      console.error('Failed to like reply:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* New Post Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Discussions ({discussions.length})
        </h3>
        <button
          onClick={() => setShowNewPostForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Discussion
        </button>
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Start a New Discussion
          </h4>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                required
                minLength={5}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="What would you like to discuss?"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                required
                minLength={10}
                maxLength={5000}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Describe your question or topic in detail..."
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                value={newPost.tags}
                onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., homework, exam, concept"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewPostForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
              >
                {submitting ? 'Posting...' : 'Post Discussion'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No discussions yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start the first discussion for this subject.
            </p>
          </div>
        ) : (
          discussions.map((post) => (
            <DiscussionCard
              key={post._id}
              post={post}
              isExpanded={expandedPost === post._id}
              onExpand={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
              onLike={() => handleLike(post._id)}
              onReplyLike={(replyId) => handleReplyLike(post._id, replyId)}
              newReply={newReply[post._id] || ''}
              onReplyChange={(content) => setNewReply(prev => ({ ...prev, [post._id]: content }))}
              onReply={(content) => handleReply(post._id, content)}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface DiscussionCardProps {
  post: DiscussionPost;
  isExpanded: boolean;
  onExpand: () => void;
  onLike: () => void;
  onReplyLike: (replyId: string) => void;
  newReply: string;
  onReplyChange: (content: string) => void;
  onReply: (content: string) => void;
}

const DiscussionCard: React.FC<DiscussionCardProps> = ({
  post,
  isExpanded,
  onExpand,
  onLike,
  onReplyLike,
  newReply,
  onReplyChange,
  onReply
}) => {
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReply.trim()) {
      onReply(newReply.trim());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-medium">
                  {post.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {post.user.name}
                </p>
                {post.isPinned && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pinned
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <EyeIcon className="h-3 w-3 mr-1" />
                  {post.viewCount} views
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Title and Content */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {post.title}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="mt-4 flex items-center space-x-6">
          <button
            onClick={onLike}
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <HandThumbUpIcon className="h-4 w-4 mr-1" />
            {post.likes.length}
          </button>

          <button
            onClick={onExpand}
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
            {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
          </button>
        </div>

        {/* Replies Section */}
        {isExpanded && (
          <div className="mt-6 space-y-4">
            {/* Existing Replies */}
            {post.replies.map((reply) => (
              <div key={reply._id} className="flex space-x-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                      {reply.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {reply.user.name}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {reply.content}
                  </p>
                  <button
                    onClick={() => onReplyLike(reply._id)}
                    className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <HandThumbUpIcon className="h-3 w-3 mr-1" />
                    {reply.likes.length}
                  </button>
                </div>
              </div>
            ))}

            {/* New Reply Form */}
            <form onSubmit={handleReplySubmit} className="pl-4 border-l-2 border-gray-200 dark:border-gray-600">
              <textarea
                value={newReply}
                onChange={(e) => onReplyChange(e.target.value)}
                placeholder="Write a reply..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
              <button
                type="submit"
                disabled={!newReply.trim()}
                className="mt-2 px-3 py-1 text-sm font-medium text-white bg-primary-600 border border-transparent rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
              >
                Reply
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionSection;