"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
// import { Draggable } from "./Draggable";
import { DragDropContext, Droppable, Draggable, DraggingStyle, NotDraggingStyle } from "react-beautiful-dnd";
import { writeFile } from "fs/promises";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import PhotoCanvas from "./PhotoCanvas";
import Cropper from "react-easy-crop";

//  ffmpeg -framerate 1 -pattern_type glob -i '*.JPG' -c:v libx264 -r 30 -pix_fmt yuv420p out.mp4

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

const grid = 8;

// const getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined) => ({
//   // some basic styles to make the items look a bit nicer
//   userSelect: "none",
//   padding: grid * 2,
//   margin: `0 ${grid}px 0 0`,

//   // change background colour if dragging
//   background: isDragging ? "lightgreen" : "grey",

//   // styles we need to apply on draggables
//   ...draggableStyle,
// });

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  display: "flex",
  padding: grid,
  overflow: "auto",
});

const reorder = (list: photo[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
// public/ffmpeg_core_dist/ffmpeg-core.js
const ffmpeg = createFFmpeg({
  log: true,
  corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
});
export default function Home() {
  // console.log('home reloaded')
  // const [items, setItems] = useState({ items: getItems(6) });
  const [photos, setPhotos] = useState<photo[] | null>(null);

  const [cropBox, setCropBox] = useState<cropBox>({
    x: 0,
    y: 0,
    width: 500,
    height: 550,
    active: false,
  });

  const [croppedPhotos, setCroppedPhotos] = useState<any>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [video, setVideo] = useState<string | null>(null);
  useEffect(() => {
    const loadFFmpeg = async () => {
      await ffmpeg.load();
    };
    loadFFmpeg();
  }, []);

  function setOpacity(index: number, value: number) {
    console.log("setOpacity on index: ", index, " to value: ", value);
    setPhotos((oldPhotos) => {
      const newPhotos = [...oldPhotos!];
      newPhotos[index].opacity = value;
      return newPhotos;
    });
  }

  function setActive(index: number, value: boolean) {
    console.log("setActive on index: ", index);
    setPhotos((oldPhotos) => {
      const newPhotos = [...oldPhotos!];
      newPhotos[index].active = newPhotos[index].active ? false : true;
      return newPhotos;
    });
  }

  function findTopActivePhoto() {
    let topActivePhoto = 0;
    photos?.forEach((photo) => {
      if (photo.active && photo.index > topActivePhoto) {
        topActivePhoto = photo.index;
      }
    });
    return topActivePhoto;
  }

  function onPhotoDragEnd(result: any) {
    if (!result.destination) {
      return;
    }
    setPhotos((oldPhotos) => {
      const newPhotos = [...oldPhotos!];
      newPhotos[result.source.index].index = result.destination.index;
      newPhotos[result.destination.index].index = result.source.index;
      const [removed] = newPhotos.splice(result.source.index, 1);
      newPhotos.splice(result.destination.index, 0, removed);
      return newPhotos;
    });
  }
  async function compilePhotoToVid(event: any): Promise<void> {
    console.log("compilePhotoToVid");

    for (let i = 0; i < photos!.length; i++) {
      ffmpeg.FS("writeFile", `file${i}.jpg`, await fetchFile(photos![i].src));
    }


    // ffmpeg needs the x and y INTO the photo, so we need to find what that is relative to the parent and cropbox
    console.log("cropBox: ", cropBox);
    // {x: 158, y: 151, width: '261px', height: '305px', active: true}
    //   {
    //     "index": 0,
    //     "x": 123.75215146299482,
    //     "y": 50,
    //     "opacity": 1,
    //     "active": true,
    //     "renderedHeight": 500,
    //     "renderedWidth": 352.49569707401037
    // }
    const indexes = [0, 1, 2, 3, 2, 1]
    let writeIndex = 0;
    for (const i of indexes) {
    // for (let i = 0; i < photos!.length; i++) {
      const photo = photos![i];
      // console.log(`photo${i}: `, photo);
      const scaleFactor = photo.actualWidth / photo.renderedWidth;
      console.log(`scaleFactor: ${scaleFactor}`)
      const scaledPhotoX = photo.x * scaleFactor;
      const scaledPhotoY = photo.y * scaleFactor;
      console.log(`scaledPhotoX: ${scaledPhotoX}, scaledPhotoY: ${scaledPhotoY}`)

      const scaledCropboxX = cropBox.x * scaleFactor;
      const scaledCropboxY = cropBox.y * scaleFactor;
      console.log(`scaledCropboxX: ${scaledCropboxX}, scaledCropboxY: ${scaledCropboxY}`)


      const cropx = Math.floor(scaledCropboxX - scaledPhotoX);
      const cropy = Math.floor(scaledCropboxY - scaledPhotoY);
      console.log(`cropx: ${cropx}, cropy: ${cropy}`)


      let scaledCropboxWidth = Math.floor(cropBox.width * scaleFactor);
      scaledCropboxWidth = scaledCropboxWidth % 2 === 0 ? scaledCropboxWidth : scaledCropboxWidth - 1;
      let scaledCropboxHeight = Math.floor(cropBox.height * scaleFactor);
      scaledCropboxHeight = scaledCropboxHeight % 2 === 0 ? scaledCropboxHeight : scaledCropboxHeight - 1;
      console.log(`scaledCropboxWidth: ${scaledCropboxWidth}, scaledCropboxHeight: ${scaledCropboxHeight}`)

      // console.log(`scaledCropboxWidth: ${scaledCropboxWidth}, scaledCropboxHeight: ${scaledCropboxHeight}, cropx: ${cropx}, cropy: ${cropy}`);
      
      await ffmpeg.run(
        "-i",
        `file${i}.jpg`,
        '-vf',
        `crop=${scaledCropboxWidth}:${scaledCropboxHeight}:${cropx}:${cropy}`,
        `cropped${writeIndex++}.jpg`
      );
      // const data = ffmpeg.FS("readFile", `cropped${i}.jpg`);
      // const url = URL.createObjectURL(
      //   new Blob([data.buffer], { type: "image/jpg" })
      // );
      // setCroppedPhotos((prev: any) => [...prev, url]);
    }

    // for (let i = 0; i < photos!.length; i++) {
    //   ffmpeg.FS("writeFile", `file${i}.jpg`, await fetchFile(photos![i].src));
    // }
    // ffmpeg.FS("writeFile", `cropped${4}.jpg`, await fetchFile(`cropped${2}.jpg`));
    // ffmpeg.FS("writeFile", `cropped${5}.jpg`, await fetchFile(`cropped${1}.jpg`));

    await ffmpeg.run(
      "-start_number",
      "0",
      "-framerate",
      "4",
      "-loop",
      "1",
      "-t",
      "10",
      "-i",
      "cropped%d.jpg",
      "-vf",
      "format=yuv420p",
      "out.mp4"
    );
    const data = ffmpeg.FS("readFile", "out.mp4");
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );
    setVideo(url);
  }

  function userUploadedPhotos(event: any): void {
    console.log("userUploadedPhotos");
    console.log(event);
    const files = event.target.files;
    console.log(files);
    const newPhotos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const src = URL.createObjectURL(file);
      console.log(`file ${i} source set to: `);
      console.log(src);
      // const img = new Image();

      newPhotos.push({
        src,
        index: i,
        x: 0,
        y: 0,
        opacity: 0.5,
        active: false,
        renderedHeight: 0,
        renderedWidth: 0,
        actualHeight: 0,
        actualWidth: 0,
      });
    }
    newPhotos[0].opacity = 1.0;
    newPhotos[0].active = true;
    setPhotos(newPhotos);
  }

  return (
    <main className="flex flex-col items-center ">
      <button
        onClick={(e) => {
          console.log("cropBox active: ", !cropBox.active);
          setCropBox((prev) => ({ ...prev, active: !prev.active }));
        }}
      >
        Turn on cropBox
      </button>
      <PhotoCanvas
        userUploadedPhotos={userUploadedPhotos}
        photos={photos}
        setPhotos={setPhotos}
        cropBox={cropBox}
        setCropBox={setCropBox}
      />
      <span>{`moving index ${findTopActivePhoto()}`}</span>
      {photos && (
        <Carousel
          photos={photos}
          onPhotoDragEnd={onPhotoDragEnd}
          setOpacity={setOpacity}
          setActive={setActive}
        />
      )}
      <button onClick={compilePhotoToVid}>create gif</button>
      {video && <video src={video} controls></video>}
      {/* {croppedPhotos && croppedPhotos.map((photo: any) => {
        return <img key={photo} src={photo} />
      })} */}
    </main>
  );
}

function Carousel({
  photos,
  onPhotoDragEnd,
  setOpacity,
  setActive,
}: {
  photos: photo[];
  onPhotoDragEnd: any;
  setOpacity: any;
  setActive: any;
}) {
// const getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined) => ({
//   // some basic styles to make the items look a bit nicer
//   userSelect: "none",
//   padding: grid * 2,
//   margin: `0 ${grid}px 0 0`,

//   // change background colour if dragging
//   background: isDragging ? "lightgreen" : "grey",

//   // styles we need to apply on draggables
//   ...draggableStyle,
// });
  return (
    <div /* this is for the 1-4 image previews + opacity sliders */
      className="mt-4"
    >
      <DragDropContext onDragEnd={onPhotoDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {photos.map((photo, index) => (
                <Draggable
                  key={photo.src}
                  draggableId={photo.src}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: "none",
                        padding: grid * 2,
                        margin: `0 ${grid}px 0 0`,
                        // change background colour if dragging
                        background: snapshot.isDragging
                          ? "lightgreen"
                          : "grey",
                        // styles we need to apply on draggables
                        ...provided.draggableProps.style,

                      }}
                    >
                      <CarouselImage
                        photo={photo}
                        setOpacity={setOpacity}
                        setActive={setActive}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

function CarouselImage({
  photo,
  setOpacity,
  setActive,
}: {
  photo: photo;
  setOpacity: any;
  setActive: any;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Image
          src={photo.src}
          alt="image"
          width={100}
          height={100}
          draggable={false}
        />
        <div className="absolute top-0 right-0 ">{photo.index}</div>
      </div>
      <div className="flex flex-row">
        {/* create a checkbox for each photo */}
        <input
          type="checkbox"
          defaultChecked={photo.active}
          onChange={(e) => setActive(photo.index)}
        />
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.01"
          defaultValue={photo.opacity}
          onChange={(e) => {
            setOpacity(photo.index, e.target.value);
            // console.log(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
