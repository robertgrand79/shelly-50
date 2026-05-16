export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  note?: string;
  needsHeadcount?: boolean;
  /** When true, this is an FYI line in the schedule and is omitted from the RSVP checkbox grid. */
  informational?: boolean;
  /** Optional ticket / external link rendered next to the title. */
  link?: { url: string; label: string };
}

export interface ScheduleDay {
  key: string;
  date: string;
  shortDate: string;
  highlight?: boolean;
  events: ScheduleEvent[];
}

export interface SchedulePart {
  part: string;
  subtitle: string;
  location: string;
  days: ScheduleDay[];
}

export const SCHEDULE: SchedulePart[] = [
  {
    part: "Part I",
    subtitle: "Downtown Bend Vibes",
    location: "Shelly + Robert staying at Marriott SpringHill Suites, Old Mill/Downtown",
    days: [
      {
        key: "tue_jun_9",
        date: "Tuesday, June 9",
        shortDate: "Tue 6/9",
        events: [
          { id: "tue_shopping", time: "Afternoon", title: "Downtown Bend birthday shopping" },
          {
            id: "tue_checkin",
            time: "4:00 PM",
            title: "Hotel base camp: Marriott SpringHill Suites (Old Mill)",
            note: "Shelly & Robert are staying here Tue–Thu. Book a room here or anywhere nearby — no RSVP needed for this one.",
            informational: true,
          },
          {
            id: "tue_welcome_dinner",
            time: "6:30 PM",
            title: "Welcome Dinner at Dear Irene",
            needsHeadcount: true,
          },
        ],
      },
      {
        key: "wed_jun_10",
        date: "Wednesday, June 10",
        shortDate: "Wed 6/10",
        events: [
          { id: "wed_river_walk", time: "9:00 AM", title: "River Walk / Hike on Deschutes River Trail" },
          { id: "wed_brunch", time: "11:30 AM", title: "Brunch at DRAKE Downtown", needsHeadcount: true },
          { id: "wed_float", time: "1:30 PM", title: "Deschutes River Float" },
          { id: "wed_dinner", time: "7:00 PM", title: "Birthday Dinner at Bos Taurus", needsHeadcount: true },
        ],
      },
      {
        key: "thu_jun_11",
        date: "Thursday, June 11",
        shortDate: "Thu 6/11",
        events: [
          { id: "thu_hike", time: "9:00 AM", title: "Morning Hike at Shevlin Park" },
          { id: "thu_brunch", time: "11:30 AM", title: "Brunch at The Lemon Tree", needsHeadcount: true },
          { id: "thu_float", time: "2:00 PM", title: "River Float Round 2" },
          {
            id: "thu_dinner",
            time: "6:30 PM",
            title: "Dinner at Zydeco Kitchen & Cocktails or Rancher Butcher",
            note: "Venue TBD based on reservation availability",
            needsHeadcount: true,
          },
        ],
      },
    ],
  },
  {
    part: "Part II",
    subtitle: "Music Festival + Birthday Festivities",
    location: "Caldera Springs Luxury Estate, Sunriver",
    days: [
      {
        key: "fri_jun_12",
        date: "Friday, June 12",
        shortDate: "Fri 6/12",
        events: [
          {
            id: "fri_reggae",
            time: "All day",
            title: "Reggae Rise Up Festival",
            note: "Secure your own tickets ASAP. Shelly + Robert will join for Rebelution and as many other bands as possible.",
            link: {
              url: "https://www.eventliveus.com/event/10202/rruor26",
              label: "Get tickets",
            },
          },
        ],
      },
      {
        key: "sat_jun_13",
        date: "Saturday, June 13",
        shortDate: "Sat 6/13",
        events: [
          {
            id: "sat_lava_cave",
            time: "10:30 AM",
            title: "Lava River Cave Exploration",
            note: "Timed ticket required",
            needsHeadcount: true,
          },
          { id: "sat_free_time", time: "Afternoon", title: "Free time — explore Bend / Sunriver" },
        ],
      },
      {
        key: "sun_jun_14",
        date: "Sunday, June 14",
        shortDate: "Sun 6/14",
        highlight: true,
        events: [
          {
            id: "sun_brunch_bash",
            time: "11:00 AM",
            title: "THE SILVER + WHITE + GOLDEN 50th Birthday Brunch Bash",
            note: "Dress code: White, Silver, or Gold! ✨",
            needsHeadcount: true,
          },
        ],
      },
      {
        key: "mon_jun_15",
        date: "Monday, June 15",
        shortDate: "Mon 6/15",
        events: [
          {
            id: "mon_farewell",
            time: "Morning",
            title: "Travel home day — safe drives!",
            note: "Pure travel day. Nothing to RSVP for.",
            informational: true,
          },
        ],
      },
    ],
  },
];

export const ALL_EVENTS: ScheduleEvent[] = SCHEDULE.flatMap((part) =>
  part.days.flatMap((day) => day.events),
);
