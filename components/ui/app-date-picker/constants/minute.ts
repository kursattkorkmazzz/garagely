import { MinuteFormatter } from "@/components/ui/app-date-picker/utils/minute-formatter";

export const Minutes = Array.from({ length: 60 }, (_, i) =>
  MinuteFormatter.format(i),
);
