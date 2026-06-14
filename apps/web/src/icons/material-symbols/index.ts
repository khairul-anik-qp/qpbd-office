import { LocalCafe } from "./local_cafe.js";
import { Tapas } from "./tapas.js";
import { Inventory2 } from "./inventory_2.js";
import { Print } from "./print.js";
import { Handyman } from "./handyman.js";
import { AddCircle } from "./add_circle.js";
import { CheckCircle } from "./check_circle.js";
import { Forward } from "./forward.js";
import { ForwardToInbox } from "./forward_to_inbox.js";
import { TaskAlt } from "./task_alt.js";
import { Schedule } from "./schedule.js";
import { PriorityHigh } from "./priority_high.js";
import { LocationOn } from "./location_on.js";
import { StickyNote2 } from "./sticky_note_2.js";
import { Notifications } from "./notifications.js";
import { Person } from "./person.js";
import { Groups } from "./groups.js";
import { Send } from "./send.js";
import { ArrowBack } from "./arrow_back.js";
import { Close } from "./close.js";
import { Inbox } from "./inbox.js";
import { InstallDesktop } from "./install_desktop.js";
import { MoreHoriz } from "./more_horiz.js";
import { Add } from "./add.js";
import { Check } from "./check.js";
import { Favorite } from "./favorite.js";
import { FavoriteFill } from "./favorite-fill.js";

export const ICON_REGISTRY = {
  "local_cafe": LocalCafe,
  "tapas": Tapas,
  "inventory_2": Inventory2,
  "print": Print,
  "handyman": Handyman,
  "add_circle": AddCircle,
  "check_circle": CheckCircle,
  "forward": Forward,
  "forward_to_inbox": ForwardToInbox,
  "task_alt": TaskAlt,
  "schedule": Schedule,
  "priority_high": PriorityHigh,
  "location_on": LocationOn,
  "sticky_note_2": StickyNote2,
  "notifications": Notifications,
  "person": Person,
  "groups": Groups,
  "send": Send,
  "arrow_back": ArrowBack,
  "close": Close,
  "inbox": Inbox,
  "install_desktop": InstallDesktop,
  "more_horiz": MoreHoriz,
  "add": Add,
  "check": Check,
  "favorite": Favorite,
  "favorite-fill": FavoriteFill,
} as const;

export type IconName = keyof typeof ICON_REGISTRY;
