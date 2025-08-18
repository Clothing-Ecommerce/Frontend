export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;     // API trả về null hoặc 'yyyy-mm-dd'
  gender: "male" | "female" | "other" | "prefer-not-to-say" | null;
  avatar: string | null;
  createdAt: string;
}