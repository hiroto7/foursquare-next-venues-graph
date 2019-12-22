import { Photo } from "./Photo";

export interface User {
  id: string;
  firstName: string;
  lastName?: string;
  gender: "male";
  photo: Photo;
}
