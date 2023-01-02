type Person = {
  name: string;
  email: string;
  label: "customer" | "employee";
  id: string;
};

type SearchResult = {
  _index: string;
  _id: string;
  _score: number;
  _source: Omit<Person, "id">;
};

type Text = {
  content: string;
  label: "employee" | "customer" | "none";
};

type TextIndexAction =
  | { type: "add"; payload: Text }
  | { type: "delete" }
  | { type: "update"; payload: Text };

export { Person, SearchResult, Text, TextIndexAction };
