/**
 * Prop and item types for every component, under unique names.
 *
 * @example
 * import { Tabs, type TabsItem } from "@kleros/ui-components-library";
 * const items: TabsItem[] = [{ id: "overview", text: "Overview", value: "overview", content: <p>…</p> }];
 */
import type { ComponentProps } from "react";
import type Accordion from "./accordion";
import type CustomAccordion from "./accordion/custom";
import type Button from "./button";
import type Card from "./container/card";
import type Box from "./container/box";
import type Modal from "./container/modal";
import type DisplayLarge from "./display/large";
import type DisplayIcon from "./display/icon";
import type DisplaySmall from "./display/small";
import type DropdownSelect from "./dropdown/select";
import type DropdownCascader from "./dropdown/cascader";
import type Form from "./form/index";
import type NumberField from "./form/number-field";
import type BigNumberField from "./form/bignumber-field";
import type TextField from "./form/text-field";
import type Searchbar from "./form/searchbar";
import type TextArea from "./form/text-area";
import type Slider from "./form/slider";
import type FileUploader from "./form/file-uploader";
import type Datepicker from "./form/datepicker";
import type Radio from "./form/radio-group";
import type CustomRadio from "./form/custom-radio";
import type Checkbox from "./form/checkbox";
import type Switch from "./form/switch";
import type AlertMessage from "./messages/alert";
import type PushMessage from "./messages/push";
import type CompactPagination from "./pagination/compact";
import type StandardPagination from "./pagination/standard";
import type Tabs from "./pagination/tabs";
import type Breadcrumb from "./breadcrumb";
import type LinearProgress from "./progress/linear";
import type CircularProgress from "./progress/circular";
import type Steps from "./progress/steps";
import type Timeline from "./progress/timeline";
import type CustomTimeline from "./progress/timeline/custom";
import type Tag from "./tag";
import type Tooltip from "./tooltip";
import type ScrollbarContainer from "./scrollbar";
import type Copiable from "./copiable";
import type DraggableList from "./draggable-list";
import type FileViewer from "./file-viewer";

export type AccordionProps = ComponentProps<typeof Accordion>;
/** One entry of `Accordion`'s `items`. */
export type AccordionItem = AccordionProps["items"][number];
export type CustomAccordionProps = ComponentProps<typeof CustomAccordion>;
export type ButtonProps = ComponentProps<typeof Button>;
export type CardProps = ComponentProps<typeof Card>;
export type BoxProps = ComponentProps<typeof Box>;
export type ModalProps = ComponentProps<typeof Modal>;
export type DisplayLargeProps = ComponentProps<typeof DisplayLarge>;
export type DisplayIconProps = ComponentProps<typeof DisplayIcon>;
export type DisplaySmallProps = ComponentProps<typeof DisplaySmall>;
export type DropdownSelectProps = ComponentProps<typeof DropdownSelect>;
/**
 * One entry of `DropdownSelect`'s `items`: `{ id, text, itemValue?, dot?, Icon?, icon? }`.
 * `callback` receives the whole item.
 */
export type DropdownSelectItem = DropdownSelectProps["items"][number];
export type DropdownCascaderProps = ComponentProps<typeof DropdownCascader>;
export type DropdownCascaderItem = DropdownCascaderProps["items"][number];
export type FormProps = ComponentProps<typeof Form>;
export type NumberFieldProps = ComponentProps<typeof NumberField>;
export type BigNumberFieldProps = ComponentProps<typeof BigNumberField>;
export type TextFieldProps = ComponentProps<typeof TextField>;
export type SearchbarProps = ComponentProps<typeof Searchbar>;
export type TextAreaProps = ComponentProps<typeof TextArea>;
export type SliderProps = ComponentProps<typeof Slider>;
export type FileUploaderProps = ComponentProps<typeof FileUploader>;
export type DatepickerProps = ComponentProps<typeof Datepicker>;
export type RadioProps = ComponentProps<typeof Radio>;
/** One entry of `Radio`'s `options`: `{ label, value }`. */
export type RadioOption = RadioProps["options"][number];
export type CustomRadioProps = ComponentProps<typeof CustomRadio>;
export type CheckboxProps = ComponentProps<typeof Checkbox>;
export type SwitchProps = ComponentProps<typeof Switch>;
export type AlertMessageProps = ComponentProps<typeof AlertMessage>;
export type PushMessageProps = ComponentProps<typeof PushMessage>;
export type CompactPaginationProps = ComponentProps<typeof CompactPagination>;
export type StandardPaginationProps = ComponentProps<typeof StandardPagination>;
export type TabsProps = ComponentProps<typeof Tabs>;
/** One entry of `Tabs`' `items`: `{ id, text, value, content }` plus optional icon and props. */
export type TabsItem = TabsProps["items"][number];
export type BreadcrumbProps = ComponentProps<typeof Breadcrumb>;
export type BreadcrumbItem = BreadcrumbProps["items"][number];
export type LinearProgressProps = ComponentProps<typeof LinearProgress>;
export type CircularProgressProps = ComponentProps<typeof CircularProgress>;
export type StepsProps = ComponentProps<typeof Steps>;
export type StepsItem = StepsProps["items"][number];
export type TimelineProps = ComponentProps<typeof Timeline>;
/** One entry of `Timeline`'s `items`: `{ title, party, subtitle, variant?, rightSided? }`. */
export type TimelineItem = TimelineProps["items"][number];
export type CustomTimelineProps = ComponentProps<typeof CustomTimeline>;
export type CustomTimelineItem = CustomTimelineProps["items"][number];
export type TagProps = ComponentProps<typeof Tag>;
export type TooltipProps = ComponentProps<typeof Tooltip>;
export type ScrollbarContainerProps = ComponentProps<typeof ScrollbarContainer>;
export type CopiableProps = ComponentProps<typeof Copiable>;
export type DraggableListProps = ComponentProps<typeof DraggableList>;
export type FileViewerProps = ComponentProps<typeof FileViewer>;
