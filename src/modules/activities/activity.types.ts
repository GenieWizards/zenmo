export interface IActivityMetadata {
  actorId: string;
  actorName: string;
  targetId?: string;
  targetName?: string;
  amount?: number;
  groupName?: string;
  categoryName?: string;
  expenseName?: string;
  msg?: string;
}
