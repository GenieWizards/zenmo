export interface IActivityMetadata {
  action: "create" | "update" | "delete";
  actorId: string;
  actorName: string;
  targetId?: string;
  targetName?: string;
  amount?: number;
  resourceType?: string;
  resourceName?: string;
  msg?: string;
}
