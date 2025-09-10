export interface Task {
    title: string,
    description: string,
    date: string
}
export interface GoogleAccount {
  provider: string;
  type: string;
  access_token: string;
  refresh_token?: string;
  expires_at: number; // seconds since epoch
  token_type?: string;
  id_token?: string;
  scope?: string;
}
