export type CoachingTeachingMode =
  | 'online'
  | 'offline'
  | 'both';

export type CoachingTeacherProfile = {
  // ServiceBazar identity
  serviceBazarUid: string;
  profileUri?: string | null;

  // Existing ServiceBazar provider profile
  name: string;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  subcategory: string;

  // Coaching-specific information
  subjects: string[];
  classes: string[];
  board?: string;
  teachingMode: CoachingTeachingMode;
  experienceYears?: number;
  qualification?: string;
  bio?: string;

  // Coaching registration status
  registrationCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};
