import React, { useEffect, useState } from "react"; // import { Resizable } from "re-resizable";
import { Rnd } from "react-rnd";

type cropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
};
const style = {
  display: "flex",
  // alignItems: "center",
  // justifyContent: "center",
  border: "solid 4px black",
  zIndex: 100,
  // background: "white",
} as const;

const styles = {
  surroundingBox: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    // background: "red",
  } as const,
};

export default function CropBox({
  cropBox,
  setCropBox,
}: {
  cropBox: cropBox;
  setCropBox: any;
}) {
  if (!cropBox.active) {
    return <></>;
  }
  // console.log("cropBox init ");
  return (
    <div style={styles.surroundingBox}>
      <Rnd
        style={style}
        default={{
          x: cropBox.x,
          y: cropBox.y,
          width: cropBox.width,
          height: cropBox.height,
        }}
        bounds="parent"
        position={{ x: cropBox.x, y: cropBox.y }}
        size={{ width: cropBox.width, height: cropBox.height }}
        onDragStop={(e, d) => {
          setCropBox({ ...cropBox, x: d.x, y: d.y });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          // convert ref.style.width to number
          const width = parseInt(ref.style.width);
          const height = parseInt(ref.style.height);
          setCropBox({
            ...cropBox,
            width,
            height,
            ...position,
          });
        }}
      >
      </Rnd>
    </div>
  );
}
