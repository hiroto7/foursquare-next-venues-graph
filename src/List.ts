import { Photo2 } from "./Photo";
import { User } from "./User";

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
  photo: Photo2;
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
