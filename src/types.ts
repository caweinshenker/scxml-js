export interface SCXMLDocument {
  scxml: SCXMLElement;
}

export interface SCXMLElement {
  initial?: string;
  name?: string;
  version?: string;
  datamodel?: string;
  xmlns?: string;
  state?: StateElement[];
  parallel?: ParallelElement[];
  final?: FinalElement[];
  datamodel_element?: DataModelElement;
  script?: ScriptElement[];
}

export interface StateElement {
  id: string;
  initial?: string;
  state?: StateElement[];
  parallel?: ParallelElement[];
  final?: FinalElement[];
  onentry?: OnEntryElement[];
  onexit?: OnExitElement[];
  transition?: TransitionElement[];
  invoke?: InvokeElement[];
  datamodel?: DataModelElement;
  history?: HistoryElement[];
}

export interface ParallelElement {
  id: string;
  state?: StateElement[];
  parallel?: ParallelElement[];
  onentry?: OnEntryElement[];
  onexit?: OnExitElement[];
  transition?: TransitionElement[];
  invoke?: InvokeElement[];
  datamodel?: DataModelElement;
  history?: HistoryElement[];
}

export interface FinalElement {
  id: string;
  onentry?: OnEntryElement[];
  onexit?: OnExitElement[];
  donedata?: DoneDataElement;
}

export interface TransitionElement {
  event?: string;
  cond?: string;
  target?: string;
  type?: 'internal' | 'external';
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface OnEntryElement {
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface OnExitElement {
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface HistoryElement {
  id: string;
  type: 'shallow' | 'deep';
  transition?: TransitionElement;
}

export interface DataModelElement {
  data?: DataElement[];
}

export interface DataElement {
  id: string;
  src?: string;
  expr?: string;
  content?: string;
}

export interface InvokeElement {
  type?: string;
  src?: string;
  id?: string;
  idlocation?: string;
  srcexpr?: string;
  autoforward?: boolean;
  param?: ParamElement[];
  finalize?: FinalizeElement;
  content?: ContentElement;
}

export interface ParamElement {
  name: string;
  expr?: string;
  location?: string;
}

export interface FinalizeElement {
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface ContentElement {
  expr?: string;
  content?: string;
}

export interface DoneDataElement {
  content?: ContentElement;
  param?: ParamElement[];
}

export interface RaiseElement {
  event: string;
}

export interface IfElement {
  cond: string;
  raise?: RaiseElement[];
  if?: IfElement[];
  elseif?: ElseIfElement[];
  else?: ElseElement;
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface ElseIfElement {
  cond: string;
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface ElseElement {
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface ForEachElement {
  array: string;
  item: string;
  index?: string;
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface LogElement {
  label?: string;
  expr?: string;
}

export interface AssignElement {
  location: string;
  expr?: string;
}

export interface SendElement {
  event?: string;
  eventexpr?: string;
  target?: string;
  targetexpr?: string;
  type?: string;
  typeexpr?: string;
  id?: string;
  idlocation?: string;
  delay?: string;
  delayexpr?: string;
  namelist?: string;
  param?: ParamElement[];
  content?: ContentElement;
}

export interface CancelElement {
  sendid?: string;
  sendidexpr?: string;
}

export interface ScriptElement {
  src?: string;
  content?: string;
}

export type ExecutableContent = 
  | RaiseElement 
  | IfElement 
  | ForEachElement 
  | LogElement 
  | AssignElement 
  | SendElement 
  | CancelElement 
  | ScriptElement;