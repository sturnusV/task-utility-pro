export type User = {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  created_at: Date;
};
