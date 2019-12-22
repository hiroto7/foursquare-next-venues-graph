import { User } from "./User";

export interface Photo {
  prefix: string;
  suffix: string;
  default?: true;
}

export interface Photo1 extends Photo {
  id: string;
  createdAt: number;
  source?: {
    name: string;
    url: string;
  };
  width: number;
  height: number;
  visibility: "public" | "friends";
}

export interface Photo2 extends Photo1 {
  user: User;
}
