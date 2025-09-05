import api from './api';
import { Resource, Rating } from '../types';

export interface UploadResourceData {
  title: string;
  type: string;
  customType?: string;
  subjectCode: string;
  yearOfPaper?: number;
  tags?: string;
  externalURL?: string;
  file?: File;
}

export const resourceService = {
  async getResourcesBySubject(subjectCode: string): Promise<Record<string, Resource[]>> {
    const response = await api.get(`/resources/subject/${subjectCode}`);
    return response.data;
  },

  async uploadResource(data: UploadResourceData): Promise<Resource> {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('type', data.type);
    formData.append('subjectCode', data.subjectCode);
    
    if (data.customType) formData.append('customType', data.customType);
    if (data.yearOfPaper) formData.append('yearOfPaper', data.yearOfPaper.toString());
    if (data.tags) formData.append('tags', data.tags);
    if (data.externalURL) formData.append('externalURL', data.externalURL);
    if (data.file) formData.append('file', data.file);

    const response = await api.post('/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getResource(resourceId: string): Promise<Resource> {
    const response = await api.get(`/resources/${resourceId}`);
    return response.data;
  },

  async downloadResource(resourceId: string): Promise<void> {
    const response = await api.get(`/resources/download/${resourceId}`, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Try to get filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'download';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async searchResources(query: string): Promise<Resource[]> {
    const response = await api.get(`/resources/search/${query}`);
    return response.data;
  }
};

export const ratingService = {
  async getRatingsForResource(resourceId: string): Promise<Rating[]> {
    const response = await api.get(`/ratings/resource/${resourceId}`);
    return response.data;
  },

  async addOrUpdateRating(resourceId: string, value: number, comment?: string): Promise<Rating> {
    const response = await api.post('/ratings', {
      resourceId,
      value,
      comment
    });
    return response.data;
  },

  async deleteRating(ratingId: string): Promise<void> {
    await api.delete(`/ratings/${ratingId}`);
  }
};