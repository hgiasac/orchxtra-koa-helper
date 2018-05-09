import * as nock from "nock";

export const TEST_AUTH_API_URL = "http://private.orchxtra.dev";
export const TEST_AUTH_USER_NAME = "d5b19006-0b48-4122-bc49-3f26aff006bf";

export const authProfile = {
  id: "7e052f90-519a-11e8-aadc-077c06c789cd",
  serviceAccountId: "74faa6f8-4f80-11e8-9c2d-fa7ae01bbebc",
  displayName: "Orchxtra Admin",
  firstName: "Orchxtra",
  lastName: "Admin",
  mobileNumber: "87654321",
  email: "toan@user.com.sg",
  roles: {},
  createdAt: "2018-05-07T02:01:01.560Z",
  updatedAt: "2018-05-07T02:01:01.560Z",
  createdBy: null,
  settings: {},
  mobileCode: "65"
};

export function mockPrivateApi() {
  nock(TEST_AUTH_API_URL)
    .get(`/users/oauth/${TEST_AUTH_USER_NAME}`)
    .reply(200, authProfile);
}
