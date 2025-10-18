export type Category = {
  id: string;
  parentId: string | null;
  name: string;
  icon: string | null;
  isGroup: boolean;
}