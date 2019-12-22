import { Likes } from "./Likes";
import { User } from "./User";

export interface Tip {
  id: string;
  createdAt: number,
  text: string;
  type: "user",
  canonicalUrl: string;
  lang: Lang;
  likes: Likes,
  logView: true,
  agreeCount: number;
  disagreeCount: number;
  lastVoteText: string;
  lastUpvoteTimestamp: number;
  todo: {
    count: number;
  };
  user: User;
}

type Lang = "ja";