import type { Contact } from './Contact';
import type { Lang } from './Lang';
import type { Likes } from './Likes';
import type { List } from './List';
import type { Photo1, Photo2 } from "./Photo";
import type { Tip } from './Tip';
import type { User1 } from './User';

export interface Venue {
  id: string;
}

export interface Venue1 extends Venue {
  name: string;
  location: Location;
  categories: Category[];
  delivery?: Delivery;
  venuePage?: VenuePage;
}

interface Location {
  address?: string;
  crossStreet?: string;
  lat: number;
  lng: number;
  labeledLatLngs?: LabeledLatLng[];
  distance?: number;
  postalCode?: string;
  cc: string;
  neighborhood?: string;
  city: string;
  state: string;
  country: string;
  formattedAddress: string[];
}

interface LabeledLatLng {
  label: "display";
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

interface Delivery {
  id: string;
  url: string;
  provider: {
    name: "seamless";
    icon: {
      prefix: "https://fastly.4sqi.net/img/general/cap/";
      sizes: [40, 50];
      name: "/delivery_provider_seamless_20180129.png";
    };
  };
}

interface VenuePage {
  id: string;
}

export interface Venue2 extends Venue1 {
  contact: Contact;
  canonicalUrl: string;
  verified: boolean;
  stats: Stats;
  price?: Price;
  url?: string;
  hasMenu?: boolean;
  likes: Likes;
  dislike: boolean;
  ok: boolean;
  rating: number;
  ratingColor: string;
  ratingSignals: number;
  menu?: Menu;
  allowMenuUrlEdit?: true;
  beenHere: BeenHere;
  specials: Specials;
  events?: Events;
  photos: Photos;
  reasons: Reasons;
  description?: string;
  storeId?: "";
  page?: Page;
  hereNow: HereNow;
  createdAt: number;
  tips: Tips;
  shortUrl: string;
  timeZone: TimeZone;
  listed: Listed;
  hours?: Hours;
  popular: Hours;
  pageUpdates: PageUpdates;
  inbox: Inbox;
  parent?: Venue1;
  hierarchy?: Hierarchy[];
  attributes: Attributes;
  bestPhoto: Photo1;
  colors: Colors;
}

interface Stats {
  checkinsCount?: number;
  usersCount?: number;
  tipCount: number;
  visitsCount?: number;
}

interface Price {
  tier: 1 | 2;
  message: "Cheap" | "Moderate";
  currency: "$";
}

type Menu = ({
  type: "Prices";
  label: "Prices";
  anchor: "View Prices";
} | {
  type: "Menu";
  label: "Menu";
  anchor: "View Menu";
} | {
  type: "Products";
  label: "Products";
  anchor: "View Products";
}) & {
  url: string;
  mobileUrl: string;
  externalUrl?: string;
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

interface Events {
  count: number;
  summary: string;
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
  items: [
    {
      summary: string;
      type: "general";
      reasonName: "rawLikesReason";
    } | {
      summary: string;
      type: "general";
      reasonName: "upcomingEventsReason";
      target?: {
        type: "navigation";
        object: {
          id: string;
          type: "events";
          target: {
            type: "path";
            url: string;
          };
          ignorable: false;
        }
      };
    }
  ];
}

interface Page {
  pageInfo?: {
    description?: string;
    banner: string;
    links: {
      count: 0 | 1;
      items: {
        url: string;
      }[];
    };
  };
  user: User1;
}


interface HereNow {
  count: number;
  summary: string;
  groups: {
    type: "others";
    name: "Other people here";
    count: number;
    items: [];
  }[];
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

type TimeZone = "Asia/Tokyo" | "America/New_York" | "America/Denver";

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
  status?: string;
  richStatus?: {
    entities: [];
    text: string;
  };
  isOpen: boolean;
  isLocalHoliday: boolean;
  dayData?: [];
  timeframes: {
    days: string;
    includesToday?: true;
    open: {
      renderedTime: string;
    }[];
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

interface Hierarchy {
  name: string;
  lang: Lang;
  id: string;
  canonicalUrl: string;
}

interface Attributes {
  groups: {
    type: string;
    name: string;
    summary?: string;
    count: number;
    items: {
      displayName: string;
      displayValue: string;
      priceTier?: number;
    }[];
  }[];
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