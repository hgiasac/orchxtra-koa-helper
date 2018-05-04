import axios, { AxiosPromise } from "axios";

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

export function getProfileByAuthId(authId: string): AxiosPromise<IProfile> {
  return axios.get(`/users/oauth/${authId}`, {
    baseURL: process.env.AUTH_API_HOST
  });
}
