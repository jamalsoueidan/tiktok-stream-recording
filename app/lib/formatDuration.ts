import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const formatDuration = (seconds: number) => {
  const dur = dayjs.duration(seconds, "seconds");
  const hours = dur.hours();
  const minutes = dur.minutes();
  const secs = dur.seconds();

  return `${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m ` : ""}${secs}s`;
};
