export interface UserModel {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferencesModel {
  id: string;
  userId: string;
  locale: string;
  preferredDistanceUnit: DistanceUnit;
  preferredCurrency: string;
  theme: Theme;
  createdAt: Date;
  updatedAt: Date;
}

export enum DistanceUnit {
  KM = 'km',
  MILES = 'miles',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export interface UserWithPreferences extends UserModel {
  preferences: UserPreferencesModel | null;
}
