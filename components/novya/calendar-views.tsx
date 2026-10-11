"use client";
import { RecordData, display } from "@/lib/novya";
export type CalendarView = "day" | "week" | "month";
export const addCalendarDays = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
export const startCalendarWeek = (date: Date) => addCalendarDays(date, -((date.getDay() + 6) % 7));
export const validCalendarEvent = (event: RecordData) => Number.isFinite(new Date(String(event.startsAt)).getTime()) && new Date(String(event.endsAt)) > new Date(String(event.startsAt));
export function calendarSegments(events: RecordData[], day: Date) {
  const start = day.getTime(), end = addCalendarDays(day, 1).getTime();
  const segments = events.filter(validCalendarEvent).filter(e => new Date(String(e.startsAt)).getTime() < end && new Date(String(e.endsAt)).getTime() > start).map(event => {
    const from = new Date(Math.max(start, new Date(String(event.startsAt)).getTime()));
    const to = new Date(Math.min(end, new Date(String(event.endsAt)).getTime()));
    return { event, from: from.getHours() * 60 + from.getMinutes(), to: to.getTime() === end ? 1440 : to.getHours() * 60 + to.getMinutes(), lane: 0, lanes: 1 };
  }).sort((a,b) => a.from - b.from || b.to - a.to);
  // Assign columns within each connected overlap group, including cross-midnight events.
  let group: typeof segments = [], groupEnd = -1;
  function finish() {
    const lanes: number[] = [];
    for (const segment of group) {
      let lane = lanes.findIndex(end => end <= segment.from);
      if (lane < 0) lane = lanes.length;
      lanes[lane] = segment.to; segment.lane = lane;
    }
    for (const segment of group) segment.lanes = lanes.length;
  }
  for (const segment of segments) {
    if (segment.from >= groupEnd) { finish(); group = []; groupEnd = -1; }
    group.push(segment); groupEnd = Math.max(groupEnd, segment.to);
  }
  finish(); return segments;
}
export function CalendarGrid({ view, days, events, open, selectDay, anchor }: { view: CalendarView; days: Date[]; events: RecordData[]; open: (event: RecordData) => void; selectDay: (day: Date) => void; anchor: Date }) {
  const time = (value: unknown) => new Date(String(value)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const content = (event: RecordData) => <><span>{time(event.startsAt)} - {time(event.endsAt)}</span><strong>{display(event.title)}</strong><small>{display(event.kind)}</small></>;
  if (view === "month") return <div className="cl-month">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(label => <div className="cl-day-head" key={label}>{label}</div>)}{days.map(day => <div className={`cl-month-day ${day.getMonth() !== anchor.getMonth() ? "cl-outside" : ""}`} key={day.toISOString()}><button aria-label={`Show ${day.toLocaleDateString("en")}`} className={day.toDateString() === new Date().toDateString() ? "cl-today" : ""} onClick={() => selectDay(day)}>{day.getDate()}</button>{calendarSegments(events,day).map(({event}) => <button key={String(event._id)} className={`cl-event cl-${event.kind}`} onClick={() => open(event)}>{content(event)}</button>)}</div>)}</div>;
  const segments = days.map(day => calendarSegments(events, day));
  const fromHour = Math.min(8, ...segments.flat().map(s => Math.floor(s.from / 60)));
  const toHour = Math.max(20, ...segments.flat().map(s => Math.ceil(s.to / 60)));
  const hours = Array.from({length: toHour - fromHour}, (_,i) => fromHour + i);
  const timezone = Intl.DateTimeFormat("en", {timeZoneName:"shortOffset"}).formatToParts(anchor).find(p=>p.type === "timeZoneName")?.value ?? "Local";
  return <div className={`cl-time-grid ${view === "day" ? "cl-single-day" : ""}`} style={{gridTemplateColumns:`54px repeat(${days.length}, minmax(90px, 1fr))`}}><div className="cl-day-head cl-timezone">{timezone}</div>{days.map(day => <button className={`cl-day-head ${day.toDateString() === anchor.toDateString() ? "cl-anchor" : ""}`} key={day.toISOString()} onClick={()=>selectDay(day)}>{day.toLocaleDateString("en", { weekday: "short", day: "numeric" })}</button>)}<div className="cl-hours">{hours.map(hour => <div key={hour}>{String(hour).padStart(2,"0")}:00</div>)}</div>{days.map((day,index) => <div className="cl-time-column" key={day.toISOString()} style={{height:hours.length*64}}>{hours.map(hour=><div className="cl-hour-line" key={hour}/>)}{segments[index].map(segment=><button key={String(segment.event._id)} className={`cl-event cl-${segment.event.kind}`} style={{top:(segment.from-fromHour*60)/60*64,height:Math.max(27,(segment.to-segment.from)/60*64-3),left:`calc(${segment.lane/segment.lanes*100}% + 3px)`,width:`calc(${100/segment.lanes}% - 6px)`}} title={`${display(segment.event.title)} · ${time(segment.event.startsAt)} - ${time(segment.event.endsAt)}`} onClick={()=>open(segment.event)}>{content(segment.event)}</button>)}</div>)}</div>;
}
export function MiniCalendar({ anchor, selectedDate = anchor, selectDay }: { anchor: Date; selectedDate?: Date; selectDay: (day: Date) => void }) {
  const first = startCalendarWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  return <div className="cl-mini">{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(label => <span key={label}>{label}</span>)}{Array.from({ length: 42 }, (_, index) => addCalendarDays(first, index)).map(day => <button key={day.toISOString()} aria-label={`Select ${day.toLocaleDateString("en")}`} aria-pressed={day.toDateString() === selectedDate.toDateString()} className={day.toDateString() === selectedDate.toDateString() ? "cl-today" : day.getMonth() !== anchor.getMonth() ? "cl-outside" : ""} onClick={() => selectDay(day)}>{day.getDate()}</button>)}</div>;
}
