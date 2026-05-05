import StationFilterSheet, {
  StationFilterSheetPayload,
} from "@/features/station/components/StationFilterSheet";
import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import SelectSheet, { SelectableItem, SelectSheetPayload } from "./SelectSheet";
import TimezoneSheet, { TimezoneSheetPayload } from "./TimezoneSheet";

declare module "react-native-actions-sheet" {
  interface Sheets {
    "select-sheet": SheetDefinition<{
      payload: SelectSheetPayload<SelectableItem>;
    }>;
    "timezone-sheet": SheetDefinition<{
      payload: TimezoneSheetPayload;
    }>;
    "station-filter-sheet": SheetDefinition<{
      payload: StationFilterSheetPayload;
    }>;
  }
}

registerSheet("select-sheet", SelectSheet);
registerSheet("timezone-sheet", TimezoneSheet);
registerSheet("station-filter-sheet", StationFilterSheet);

export {};
