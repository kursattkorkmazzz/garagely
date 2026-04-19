import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import SelectSheet, { SelectableItem, SelectSheetPayload } from "./SelectSheet";

declare module "react-native-actions-sheet" {
  interface Sheets {
    "select-sheet": SheetDefinition<{
      payload: SelectSheetPayload<SelectableItem>;
    }>;
  }
}

registerSheet("select-sheet", SelectSheet);

export {};
