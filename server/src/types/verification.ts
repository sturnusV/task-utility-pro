export interface UserWithVerification {
    google_id: boolean;
    id: number;
    username: string;
    email: string;
    password_hash: string;
    email_verified: boolean;
    email_verification_token: string | null;
    email_verification_token_expires: Date | null;
    created_at: Date;
}