import React from "react";

interface IDataPickerContext {
  focusedDate: Date | null;
  isDateFocused: (date: Date) => boolean;
  isDateSelected: (date: Date) => boolean;
  isDateHovered: (date: Date) => boolean;
  isDateBlocked: (date: Date) => boolean;
  isFirstOrLastSelectedDate: (date: Date) => boolean;
  onDateFocus: (date: Date) => void;
  onDateHover: (date: Date) => void;
  onDateSelect: (date: Date) => void;
}

const datepickerContextDefaultValue: IDataPickerContext = {
  focusedDate: null,
  isDateFocused: () => false,
  isDateSelected: () => false,
  isDateHovered: () => false,
  isDateBlocked: () => false,
  isFirstOrLastSelectedDate: () => false,
  onDateFocus: () => {
    //do nothing
  },
  onDateHover: () => {
    //do nothing
  },
  onDateSelect: () => {
    //do nothing
  },
};

export default React.createContext(datepickerContextDefaultValue);
