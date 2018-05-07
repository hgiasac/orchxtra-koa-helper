import axios, { AxiosPromise } from "axios";
import { catchHTTPRequestException, COGNITO_USERNAME_HEADER, IDBContext } from ".";

export interface IAuthUser {
  id: string;
  serviceAccountId: string;
  displayName: string;
  firstName: string;
  lastName: string;

  mobileCode: string;
  mobileNumber: string;
  email: string;
  roles: any;
  createdBy: string;
  settings: any;
  createdAt: string;
  updatedAt: string;
}

export interface IServiceAccount {

  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  firstName: string;

  lastName: string;
  licenceId: string;
  registeredAt: Date;
  expiredAt: Date;
  settings: any;
  createdAt: string;
  updatedAt: string;
}

export interface IProfile extends IAuthUser {
  serviceAccount: IServiceAccount;
}

export interface IAuthContext extends IDBContext {
  authUser: IAuthUser;
}

export function getProfileByAuthId(authId: string): AxiosPromise<IProfile> {
  return axios.get(`/users/oauth/${authId}`, {
    baseURL: process.env.AUTH_API_HOST
  });
}

export interface IAuthMiddlewareOptions {
  authIdHeaderName?: string;
}

export function AuthMiddleware(options?: IAuthMiddlewareOptions) {

  const { authHeadeauthIdHeaderNamer = COGNITO_USERNAME_HEADER } = { ...options };

  return async (ctx: IAuthContext, next: () => any) => {

    const username = ctx.headers[authHeadeauthIdHeaderNamer];
    if (!username) {
      ctx.throw(404);
    }

    try {
      const userResult = await getProfileByAuthId(username);
      const profile: IProfile = userResult.data;
      ctx.authUser = profile;
      next();

    } catch (e) {
      catchHTTPRequestException(ctx, e);
    }
  };

}
