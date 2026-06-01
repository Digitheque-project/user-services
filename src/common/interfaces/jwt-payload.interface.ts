export interface JwtPayload {
  userId: string;

  username: string;

  services: {
    name: string;
    role: string;
    permissions: string[];
  }[];
}
