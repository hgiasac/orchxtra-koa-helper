import axios, { AxiosPromise } from "axios";
import { catchHTTPRequestException } from "./error";
import {
  COGNITO_USERNAME_HEADER, IDBContext,
} from "./handler";

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

export interface IAuthContextState {
  authUser: IAuthUser;
}

export interface IAuthContext<T = any> extends IDBContext<T> {
  state: IAuthContextState;
}

export function getProfileByAuthId(authId: string, options?: {
  baseURL?: string
}): AxiosPromise<IProfile> {
  const { baseURL = process.env.AUTH_API_HOST } = { ...options };

  return axios.get(`/users/oauth/${authId}`, {
    baseURL
  });
}

export interface IAuthMiddlewareOptions {
  baseURL?: string;
  authIdHeaderName?: string;
}

export function AuthMiddleware(options?: IAuthMiddlewareOptions) {

  const {
    authIdHeaderName = COGNITO_USERNAME_HEADER,
    baseURL = process.env.AUTH_API_HOST,
  } = { ...options };

  return async (ctx: IAuthContext, next: () => any) => {

    const username = ctx.headers[authIdHeaderName];
    if (!username) {
      ctx.throw(401, "OAuth Username is empty");
    }

    try {
      if (ctx.debug) {
        ctx.logger.log({
          baseURL,
          message: "Get profile by Auth ID",
          authId: username
        });
      }

      const userResult = await getProfileByAuthId(username, { baseURL });
      const profile: IProfile = userResult.data;
      ctx.state.authUser = profile;

      return next();

    } catch (e) {
      catchHTTPRequestException(ctx, e);
    }
  };

}
