import { getPermissionName, AuthorizationMiddleware } from "./middleware";

export enum CrudAction {
  Create = "create",
  ListView = "list_view",
  ViewOnly = "view_only",
  Update = "update",
  UpdateOwn = "update_own",
  Delete = "delete",
  DeleteOwn = "delete_own",
}

export interface ICrudAuthorizers {
  listViewPermission: string;
  viewOnlyPermission: string;
  createPermission: string;
  updatePermission: string;
  deletePermission: string;
  listView: any;
  view: any;
  create: any;
  update: any;
  delete: any;
}

export function generateCrudAuthorizers(
  group: string, subModule: string
): ICrudAuthorizers {

  const listViewPermission = getPermissionName([
    group, subModule, CrudAction.ListView
  ]);

  const viewOnlyPermission = getPermissionName([
    group, subModule, CrudAction.ViewOnly
  ]);

  const createPermission = getPermissionName([
    group, subModule, CrudAction.Create
  ]);

  const updatePermission = getPermissionName([
    group, subModule, CrudAction.Update
  ]);

  const deletePermission = getPermissionName([
    group, subModule, CrudAction.Delete
  ]);

  const listView = AuthorizationMiddleware({
    accept: [listViewPermission]
  });

  const view = AuthorizationMiddleware({
    accept: [viewOnlyPermission, listViewPermission]
  });

  const create = AuthorizationMiddleware({
    accept: [createPermission]
  });

  const update = AuthorizationMiddleware({
    accept: [updatePermission]
  });

  const del = AuthorizationMiddleware({
    accept: [deletePermission]
  });

  return {
    listViewPermission,
    viewOnlyPermission,
    createPermission,
    updatePermission,
    deletePermission,
    listView,
    create,
    view,
    update,
    delete: del
  };
}
