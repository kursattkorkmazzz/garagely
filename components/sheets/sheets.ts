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
  }
}

registerSheet("select-sheet", SelectSheet);
registerSheet("timezone-sheet", TimezoneSheet);

export {};
