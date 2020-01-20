import type { Photo2 } from "./Photo";
import type { User } from "./User";

export interface List {
  id: string;
  name: string;
  description: string;
  type: "others",
  user: User,
  editable: false,
  public: true,
  collaborative: boolean,
  url: string;
  canonicalUrl: string;
  createdAt: number,
  updatedAt: number,
  photo?: Photo2;
  logView?: true;
  guideType?: "bestOf";
  guide?: true;
  followers: {
    count: number;
  };
  listItems: ListItems;
}

interface ListItems {
  count: number;
  items: [
    ListItem
  ];
}

interface ListItem {
  id: string;
  createdAt: number;
  photo?: Photo2;
}
