import { Text, TextIndexAction } from "../types/api";

function textIndexReducer(state: Text[], action: TextIndexAction) {
  const lastIdx = state.length - 1;
  const last = state[lastIdx];
  switch (action.type) {
    case "add":
      const { payload } = action;
      const { content, label } = payload;
      if (!state.length) return [{ ...payload }];

      if (label === "customer" || label === "employee") {
        return [
          ...state.slice(0, lastIdx),
          { ...last, content: last.content.slice(0, -1) },
          { content, label },
          { content: " ", label: "none" } as {
            content: string;
            label: "none" | "employee" | "customer";
          },
        ];
      }
      if (last.label !== "none") return [...state, payload];
      else
        return [
          ...state.slice(0, lastIdx),
          { ...last, content: `${last.content}${content}` },
        ];

    case "delete":
      return last.label === "none"
        ? last.content.trim().length === 0
          ? [...state.slice(0, lastIdx)]
          : [
              ...state.slice(0, lastIdx),
              { ...last, content: last.content.slice(0, -1) },
            ]
        : [
            ...state.slice(0, lastIdx),
            { content: " ", label: "none" } as {
              content: string;
              label: "none" | "employee" | "customer";
            },
          ];

    default:
      throw new Error(`unHandeled action ${action.type} at textIndexReducer`);
  }
}

export default textIndexReducer;
