import React from "react";
import InputTrigger from "react-input-trigger";
import { Spinner, Highlighter } from "./index";
import textIndexReducer from "../reducers/textIndexReducer";
import { Meta } from "../types/react-input-trigger";
import { Person, SearchResult } from "../types/api";

function MentionArea() {
  const [state, setState] = React.useState({
    left: 0,
    top: 0,
    isSuggestor: false,
    query: "",
    currentSelection: 0,
    currentPotionalSelection: 0,
    scrollThrough: null as "keyboard" | "mouse" | null,
  });

  const [fetchState, setFetchState] = React.useState<{
    loading: boolean;
    data: Person[] | null;
    error: Error | null;
  }>({ loading: false, data: null, error: null });

  const [textIndex, setTextIndex] = React.useReducer(textIndexReducer, []);

  const text = textIndex.reduce((acc, curr) => {
    return acc + curr.content;
  }, "");

  const listRef = React.useRef<HTMLDivElement | null>(null);
  let endTriggerHandler = React.useRef<Function | null>(null);

  const { left, top, isSuggestor, query, currentSelection, scrollThrough } =
    state;
  const { loading, data } = fetchState;

  function setSuggestor(meta: Meta) {
    const { hookType, cursor } = meta;

    switch (hookType) {
      case "start":
        setState((state) => ({
          ...state,
          isSuggestor: true,
          left: cursor.left,
          top: cursor.top + cursor.height,
          currentPotionalSelection: cursor.selectionStart,
        }));
        break;
      case "cancel":
        setState((state) => ({
          ...state,
          isSuggestor: false,
          top: 0,
          left: 0,
          query: "",
          currentSelection: 0,
          currentPotionalSelection: 0,
          scrollThrough: null,
        }));
        break;

      default:
        break;
    }
  }

  function handleQueryInput(meta: Meta) {
    if (meta.hookType === "typing")
      setState((state) => ({
        ...state,
        query: state.isSuggestor ? meta.text.toLowerCase() : "",
        currentSelection: state.currentSelection,
      }));
  }

  const handleTextAreaKeyDown: React.KeyboardEventHandler<
    HTMLTextAreaElement
  > = (e) => {
    const { code, key } = e;

    if (key.length > 1)
      if (code === "Backspace") return setTextIndex({ type: "delete" });
      else return;

    const keyCode = key.charCodeAt(0);

    if (keyCode >= 32 && keyCode <= 126)
      setTextIndex({ type: "add", payload: { content: key, label: "none" } });
  };

  const selectItem = () => {
    if (data) {
      setState((state) => ({
        ...state,
        currentPotionalSelection: 0,
        isSuggestor: false,
        left: 0,
        top: 0,
        query: "",
      }));
      setTextIndex({
        type: "add",
        payload: {
          content: data[currentSelection].name,
          label: data[currentSelection].label,
        },
      });
      if (endTriggerHandler.current) endTriggerHandler.current();
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const { key } = e;
    if (key === "Enter" && isSuggestor && data) {
      e.preventDefault();
      selectItem();
    }

    if ((key === "ArrowDown" || key === "ArrowUp") && data) {
      e.preventDefault();
      setState((state) => ({
        ...state,
        scrollThrough: "keyboard",
        currentSelection:
          key === "ArrowDown"
            ? (state.currentSelection + 1) % data?.length
            : state.currentSelection === 0
            ? data.length - 1
            : state.currentSelection - 1,
      }));
    }
  };

  const handleMouseOver = (selectionIdx: number) =>
    setState((state) => ({
      ...state,
      scrollThrough: "mouse",
      currentSelection: selectionIdx,
    }));

  React.useEffect(() => {
    if (isSuggestor) {
      setFetchState({ loading: true, data: null, error: null });
      fetch(`/search?q=${query}`)
        .then((res) => res.json())
        .then((hits: SearchResult[]) => {
          setFetchState({
            loading: false,
            data: hits.map((hit) => ({ ...hit._source, id: hit._id })),
            error: null,
          });
        })
        .catch((error) => setFetchState({ data: null, loading: false, error }));
    }
  }, [isSuggestor, query]);

  React.useLayoutEffect(() => {
    if (listRef.current && scrollThrough === "keyboard" && data) {
      const item = listRef.current.firstElementChild as HTMLDivElement;
      const itemHeight = item.offsetHeight;

      if (currentSelection * itemHeight > listRef.current.scrollTop)
        listRef.current.scrollTop = listRef.current.scrollTop + itemHeight;

      if (currentSelection * itemHeight < listRef.current.scrollTop)
        listRef.current.scrollTop = listRef.current.scrollTop - itemHeight;

      if (currentSelection === 0) listRef.current.scrollTop = 0;
      if (currentSelection === data?.length - 1)
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [currentSelection, data, scrollThrough]);

  return (
    <div
      style={{
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          minHeight: "100px",
          fontFamily: "sans-serif",
          fontSize: "1.2em",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
        }}
        onKeyDown={handleKeyDown}
      >
        <Highlighter paragraphes={textIndex} />
        <InputTrigger
          trigger={{
            keyCode: 50,
            shiftKey: true,
          }}
          onStart={setSuggestor}
          onCancel={setSuggestor}
          onType={handleQueryInput}
          endTrigger={(endTrigger: () => void) => {
            endTriggerHandler.current = endTrigger;
          }}
        >
          <textarea
            onKeyDown={handleTextAreaKeyDown}
            value={text}
            placeholder="Mention people using '@'"
            style={{
              height: "100%",
              width: "400px",
              lineHeight: "2em",
              fontSize: "inherit",
              fontFamily: "inherit",
              resize: "none",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap",
              overflow: "hidden",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </InputTrigger>
        <div
          ref={listRef}
          style={{
            position: "absolute",
            top: `calc(${top}px - 1.5em)`,
            left: left,
            width: "200px",
            borderRadius: "6px",
            background: "white",
            boxShadow: "rgba(0, 0, 0, 0.4) 0px 1px 4px",
            display: isSuggestor ? "block" : "none",
            maxHeight: "25vh",
            overflowY: "scroll",
          }}
        >
          {loading ? (
            <Spinner />
          ) : (
            data &&
            data.map(({ name, id, label }, index) => (
              <div
                key={id}
                style={{
                  padding: ".5rem 1rem",
                  fontSize: ".7em",
                  background: index === currentSelection ? "#8989ff" : "",
                }}
                onMouseOver={() => handleMouseOver(index)}
                onMouseUp={selectItem}
              >
                {name}
                <span> {`(${label})`}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MentionArea;
