export interface User {
  id: string;
  email: string;
  name: string;
  profile?: {
    branch: string;
    year: number;
    semester: number;
    section: string;
  };
  isSetupComplete: boolean;
  avatar?: string;
  uploadedResources?: string[];
  createdAt?: string;
}

export interface Subject {
  _id: string;
  subjectName: string;
  subjectCode: string;
  professorName?: string;
  branch: string;
  year: number;
  semester: number;
  description?: string;
  credits?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Resource {
  _id: string;
  title: string;
  type: ResourceType;
  customType?: string;
  fileURL?: string;
  externalURL?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  subject: Subject | string;
  uploader: User | string;
  yearOfPaper?: number;
  tags: string[];
  averageRating: number;
  totalRatings: number;
  downloads: number;
  views: number;
  description?: string;
  isVisible: boolean;
  isApproved: boolean;
  createdAt: string;
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
  user: User | string;
  resource: Resource | string;
  value: number;
  comment?: string;
  createdAt: string;
}

export interface DiscussionReply {
  _id: string;
  user: User;
  content: string;
  likes: string[];
  isEdited: boolean;
  createdAt: string;
}

export interface DiscussionPost {
  _id: string;
  subject: Subject | string;
  user: User;
  title: string;
  content: string;
  replies: DiscussionReply[];
  tags: string[];
  likes: string[];
  isPinned: boolean;
  isClosed: boolean;
  isEdited: boolean;
  viewCount: number;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  completeSetup: (profileData: ProfileSetupData) => Promise<void>;
  loading: boolean;
}

export interface ProfileSetupData {
  branch: string;
  year: number;
  semester: number;
  section: string;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export interface FileUpload {
  fileName: string;
  fileURL: string;
  fileSize: number;
  fileType: string;
}