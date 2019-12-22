import { User } from "./User";

export interface Likes {
  count: number;
  groups: {
    type: "friends" | "others";
    count: number;
    items: User[];
  }[];
  summary?: string;
}