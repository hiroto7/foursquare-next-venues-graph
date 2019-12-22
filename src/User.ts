import { Contact } from "./Contact";
import { Photo } from "./Photo";
import { Venue } from "./Venue";

export interface User {
  id: string;
  firstName: string;
  lastName?: string;
  gender: "none" | "male" | "female";
  photo: Photo;
  type?: "chain" | "page" | "venuePage";
  venue?: Venue;
}

export interface User1 extends User {
  tips: {
    count: number;
  };
  lists: {
    groups: [
      {
        type: "created",
        count: 2,
        items: []
      }
    ]
  };
  homeCity: string;
  bio: string;
  contact: Contact;
}