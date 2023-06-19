"use client";

import Image from "next/image";
import Draggable from "react-draggable";
import CropBox from "./CropBox";
import { useState, useEffect } from "react";

type photo = {
  src: string;
  index: number;
  x: number;
  y: number;
  opacity: number;
  active: boolean;
  actualHeight: number;
  actualWidth: number;
  renderedHeight: number;
  renderedWidth: number;
};

type cropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
};

export default function PhotoCanvas({
  photos,
  userUploadedPhotos,
  setPhotos,
  cropBox,
  setCropBox,
}: {
  photos: photo[] | null;
  userUploadedPhotos: any;
  setPhotos: any;
  cropBox: cropBox;
  setCropBox: any;
}) {
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });
  // 2048 x 2905

  if (!photos) {
    return (
      <div className="h-[600px] w-[600px] bg-slate-300 flex flex-col justify-center items-center">
        <input type="file" multiple onChange={userUploadedPhotos} />
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-[600px] bg-slate-300">
      <CropBox cropBox={cropBox} setCropBox={setCropBox} />
      { photos.map((photo) => {
        return (
          photo.active && (
            <Draggable
              key={photo.src}
              bounds="parent"
              // defaultPosition={{ x: photo.x, y: photo.y }}
              // onStart={(e, data) => {
              //   console.log("dragging start: ");
              //   console.log(data);
              //   console.log(e)
              // }}
              onStop={(e, data) => {
                e.preventDefault();
                // console.log("dragging stop: ");
                // console.log(data);
                // console.log(e);
                const { x, y } = data;
                // console.log(`x: ${x}, y: ${y}`);

                setPhotos((prev: photo[]) => {
                  return prev.map((p: photo) => {
                    if (p.src === photo.src) {
                      return {
                        ...p,
                        x: data.x + initialOffset.x,
                        y: data.y + initialOffset.y,
                      };
                    }
                    return p;
                  });
                });
              }}
            >
              <Image
                // className={`absolute`}
                src={photo.src}
                alt="image"
                // style={{objectFit: "contain"}}
                // fill={true}
                width={photo.renderedWidth}
                height={photo.renderedHeight}
                draggable={false}
                // style={{ opacity: photo.opacity, objectFit: "contain" }}
                style={{
                  position: "absolute",
                  opacity: photo.opacity,
                  height: photo.renderedHeight,
                  width: "auto",
                  left: initialOffset.x,
                  top: initialOffset.y,
                  zIndex: photo.index,
                }}
                onLoadingComplete={(target) => {
                  // console.log(target);
                  const { naturalWidth, naturalHeight } =
                    target as HTMLImageElement;
                  console.log("image loaded, natwidth, natheight: ");
                  console.log(naturalWidth, naturalHeight);
                  // preserve aspect ratio find the largest size it can be that fits inside the box
                  // let nH = naturalHeight;
                  const aspectRatio = naturalWidth / naturalHeight;
                  console.log("aspect ratio: " + aspectRatio);
                  const newHeight = 500;

                  const newWidth = newHeight * aspectRatio;
                  console.log("new width: " + newWidth);
                  const xOffset = 300 - newWidth / 2;
                  const yOffset = 50;

                  if (initialOffset.x === 0 && initialOffset.y === 0) {
                    setInitialOffset({
                      x: xOffset,
                      y: yOffset,
                    });
                    // setCropBox(() => {width: newWidth, height: newHeight, x: xOffset, y: yOffset})
                    // setCropBox(prev=>
                    //   ({ ...prev, width: newWidth, height: newHeight, x: 300 - newWidth / 2, y: 50 });
                    // );
                  }

                  setPhotos((prev: photo[]) => {
                    return prev.map((p: photo) => {
                      if (p.src === photo.src) {
                        return {
                          ...p,
                          renderedHeight: newHeight,
                          renderedWidth: newWidth,
                          actualHeight: naturalHeight,
                          actualWidth: naturalWidth,
                          x: xOffset,
                          y: yOffset,
                        };
                      }
                      return p;
                    });
                  });
                }}
              />
            </Draggable>
          )
        );
      })}
    </div>
  );
}
