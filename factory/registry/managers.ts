import type { ManagerDefinition } from '@/factory/types/managerTypes';

export const FACTORY_MANAGERS: ManagerDefinition[] = [
  {
    id: 'coaching-manager',
    title: 'Coaching Manager',
    subtitle: 'Manage coaching, students, courses and classes',
    icon: 'school-outline',
    category: 'Management',
    price: 'Free',

    requiredModules: [
      'member-management',
      'enrollment',
      'course-management',
      'batch-management',
      'class-management',
    ],

    optionalModules: [
      'attendance-management',
      'fees-management',
      'payments',
      'timetable',
      'live-class',
      'video',
      'documents',
      'assignments',
      'exams',
      'results',
      'notices',
      'reminders',
      'notification-management',
      'communication',
      'teacher-management',
      'reports',
      'certificate',
    ],
  },
];
