export interface User {
  id: string;
  name: string;
  email: string;
  isProfileComplete: boolean;
  profile?: {
    branch: string;
    year: number;
    semester: number;
    section: string;
  };
  uploadedResources?: string[];
}

export interface Subject {
  _id: string;
  subjectName: string;
  subjectCode: string;
  professorName?: string;
  branch: string;
  year: number;
  semester: number;
}

export interface Resource {
  _id: string;
  title: string;
  type: ResourceType;
  customType?: string;
  fileURL?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  externalURL?: string;
  subject: Subject | string;
  uploader: {
    _id: string;
    name: string;
  };
  yearOfPaper?: number;
  tags: string[];
  averageRating: number;
  totalRatings: number;
  downloads: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = 
  | 'Course Plan'
  | 'CT Paper'
  | 'End Sem Paper'
  | 'PPT'
  | 'Class Notes'
  | 'Reference Book'
  | 'YouTube Link'
  | 'Custom';

export interface Rating {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  resource: string;
  value: number;
  comment?: string;
  createdAt: string;
}

export interface DiscussionPost {
  _id: string;
  subject: Subject | string;
  user: {
    _id: string;
    name: string;
  };
  title: string;
  content: string;
  replies: DiscussionReply[];
  isResolved: boolean;
  views: number;
  createdAt: string;
}

export interface DiscussionReply {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  content: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}