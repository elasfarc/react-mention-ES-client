type HookType = "start" | "cancel" | "typing";
type Cursor = {
  height: number;
  top: number;
  left: number;
  selectionEnd: number;
  selectionStart: number;
};
// type BaseMeta = {
//   hookType: HookType;
//   cursor: Cursor;
// };

// type TypeMeta = BaseMeta & { text: string };

type BaseMeta = {
  cursor: Cursor;
};

type StartCancelMeta = BaseMeta & {
  hookType: Extract<HookType, "start" | "cancel">;
};

type TypeMeta = BaseMeta & {
  hookType: Extract<HookType, "typing">;
  text: string;
};

type Meta = StartCancelMeta | TypeMeta;

export { Meta };
