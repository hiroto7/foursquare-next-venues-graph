import type { Lang } from "./Lang";
import type { Likes } from "./Likes";
import type { Photo1 } from "./Photo";
import type { User } from "./User";

export interface Tip {
  id: string;
  createdAt: number,
  text: string;
  type: "user",
  canonicalUrl: string;
  photo?: Photo1;
  photourl?: string;
  lang: Lang;
  likes: Likes;
  logView: true;
  editedAt?: number;
  agreeCount: number;
  disagreeCount: number;
  lastVoteText?: string;
  lastUpvoteTimestamp?: number;
  lastDownvoteTimestamp?: number;
  todo: {
    count: number;
  };
  user: User;
  authorInteractionType?: "liked" | "meh";
}
