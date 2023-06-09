// const { useRef, useState, useEffect } = require("react");
import { useRef, useState, useEffect } from "react";
import React from "react";

type coordinates = {
  x: number;
  y: number;
};

type stateType = {
  pos: coordinates;
  dragging: boolean;
  rel: coordinates ;
};

export const Draggable = ({
  children,
  initialPos,
  fixOnAxis,
}: {
  children: any;
  initialPos: coordinates;
  fixOnAxis: string;
}) => {
  const ref = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [state, setState] = useState<stateType>({
    pos: initialPos,
    dragging: false,
    rel: { x: 0, y: 0 }, // position relative to the cursor
  });

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    console.log(state);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [state.dragging]);

  // calculate relative position to the mouse and set dragging=true
  const onMouseDown = (e: any) => {
    // only left mouse button
    if (e.button !== 0) return;

    var pos = ref.current.getBoundingClientRect();
    const rel = {
      x: e.pageX - pos.left,
      y: e.pageY - pos.top,
    };

    setState((p) => ({ ...p, dragging: true, rel }));
    e.stopPropagation();
    e.preventDefault();
  };
  const onMouseUp = (e: any) => {
    setState((p) => ({ ...p, dragging: false }));
    e.stopPropagation();
    e.preventDefault();
  };
  const onMouseMove = (e: any) => {
    if (!state.dragging) return;
    const pos = {
      x: e.pageX - state.rel.x,
      y: e.pageY - state.rel.y,
    };
    setState((p) => ({ ...p, pos }));
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{
        position: "absolute",
        left: state.pos.x,
        top: state.pos.y,
      }}
    >
      {children}
    </div>
  );
};
