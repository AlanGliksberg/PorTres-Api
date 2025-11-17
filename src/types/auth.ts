export interface RegisterDTO {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  dni?: string;
  photoUrl?: string;
  socialId?: string;
  socialPlatform?: string;
  phone?: string;
}

export interface RefreshTokenDTO {
  token: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface LogoutDTO {
  expoPushToken?: string;
}

export interface AppleLoginDTO {
  identityToken: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}
