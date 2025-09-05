import api from './api';
import { Subject } from '../types';

export const subjectService = {
  async getMySubjects(): Promise<Subject[]> {
    const response = await api.get('/subjects/my-subjects');
    return response.data;
  },

  async getSubjectByCode(subjectCode: string): Promise<Subject> {
    const response = await api.get(`/subjects/${subjectCode}`);
    return response.data;
  },

  async createSubject(subjectData: Partial<Subject>) {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  async searchSubjects(query: string): Promise<Subject[]> {
    const response = await api.get(`/subjects/search/${query}`);
    return response.data;
  }
};