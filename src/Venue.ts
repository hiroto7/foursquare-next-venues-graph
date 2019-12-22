import { Likes } from './Likes';
import { List } from './List';
import { Photo1, Photo2 } from "./Photo";
import { Tip } from './Tip';

export interface Venue {
  id: string;
  name: string;
  location: Location;
  categories: Category[];
}

interface Location {
  address: string;
  crossStreet?: string;
  lat: number;
  lng: number;
  labeledLatLngs: LabeledLatLng[];
  distance?: number;
  postalCode: string;
  cc: string;
  neighborhood?: string;
  city: string;
  state: string;
  country: string;
  formattedAddress: string[];
}

interface LabeledLatLng {
  label: string;
  lat: number;
  lng: number;
}

interface Category {
  id: string;
  name: string;
  pluralName: string;
  shortName: string;
  icon: Icon;
  primary?: boolean;
}

interface Icon {
  prefix: string;
  suffix: string;
}

export interface Venue1 extends Venue {
  contact: Contact;
  canonicalUrl: string;
  verified: boolean;
  stats: Stats;
  likes: Likes;
  dislike: boolean;
  ok: boolean;
  rating: number;
  ratingColor: string;
  ratingSignals: number;
  allowMenuUrlEdit: boolean,
  beenHere: BeenHere;
  specials: Specials;
  photos: Photos;
  reasons: Reasons;
  hereNow: HereNow;
  createdAt: number;
  tips: Tips;
  shortUrl: string;
  timeZone: TimeZone;
  listed: Listed;
  hours: Hours;
  pageUpdates: PageUpdates;
  inbox: Inbox;
  attributes: Attributes;
  bestPhoto: Photo1;
  colors: Colors;
}

interface Contact {
  phone?: string;
  formattedPhone?: string;
  facebook?: string;
  facebookUsername?: string;
  facebookName?: string;
}

interface Stats {
  checkinsCount?: number;
  usersCount?: number;
  tipCount: number;
}

interface BeenHere {
  count: number;
  unconfirmedCount: number;
  marked: boolean;
  lastCheckinExpiredAt: number;
}

interface Specials {
  count: number;
  items: never[];
}

interface Photos {
  count: number,
  groups: [
    {
      type: "venue";
      name: string;
      count: number;
      items: Photo2[];
    }
  ]
}

interface Reasons {
  count: number;
  items: {
    summary: "Lots of people like this place";
    type: "general";
    reasonName: "rawLikesReason";
  }[];
}

interface HereNow {
  count: number;
  summary: "Nobody here";
  groups: never[];
}

interface Tips {
  count: number;
  groups: {
    type: "others",
    name: "All tips",
    count: number,
    items: Tip[];
  }[];
}

type TimeZone = "Asia/Tokyo";

interface Listed {
  count: number;
  groups: [
    {
      type: "others";
      name: "Lists from other people";
      count: number;
      items: List[];
    }
  ];
}

interface Hours {
  status: string;
  richStatus: {
    entities: [];
    text: string;
  };
  isOpen: boolean;
  isLocalHoliday: boolean;
  dayData: [];
  timeframes: {
    days: string;
    includesToday: boolean;
    open: [
      {
        renderedTime: string
      }
    ];
    segments: [];
  }[];
}

interface PageUpdates {
  count: number;
  items: never[];
}

interface Inbox {
  count: number;
  items: never[];
}

interface Attributes {
  groups: [
    {
      type: "payments",
      name: "Credit Cards",
      summary: "Credit Cards",
      count: 5,
      items: [
        {
          "displayName": "Credit Cards",
          "displayValue": "Yes"
        }
      ]
    }
  ]
}

interface Colors {
  highlightColor: {
    photoId: string;
    value: number;
  };
  highlightTextColor: {
    photoId: string;
    value: number;
  };
  algoVersion: 3;
}