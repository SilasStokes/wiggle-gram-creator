"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
// import { Draggable } from "./Draggable";
import Draggable1 from "react-draggable";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

type photo = {
  src: string;
  index: number;
  x: number;
  y: number;
  opacity: number;
  active: boolean;
};

type cropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  display: "flex",
  padding: grid,
  overflow: "auto",
});

const imgPaths = [
  "/images/1.JPG",
  "/images/2.JPG",
  "/images/3.JPG",
  "/images/4.JPG",
];

const reorder = (list: photo[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default function Home() {
  // console.log('home reloaded')
  // const [items, setItems] = useState({ items: getItems(6) });
  const [photos, setPhotos] = useState<photo[]>(
    imgPaths.map((src, index) => ({
      src,
      index,
      x: 0,
      y: 0,
      opacity: 0.5,
      active: false,
    }))
  );

  useEffect(() => {
    setPhotos((oldPhotos) => {
      const newPhotos = [...oldPhotos];
      newPhotos[0].opacity = 1.0;
      newPhotos[0].active = true;
      // for (let i = 1; i < newPhotos.length; i++) {
      //   newPhotos[i].active = false;
      // }
      return newPhotos;
    });
  }, []);

  function setOpacity(index: number, value: number) {
    console.log("setOpacity on index: ", index, " to value: ", value);
    setPhotos((oldPhotos) => {
      const newPhotos = [...oldPhotos];
      newPhotos[index].opacity = value;
      return newPhotos;
    });
  }

  function setActive(index: number, value: boolean) {
    console.log("setActive on index: ", index);
    setPhotos((oldPhotos) => {
      const newPhotos = [...oldPhotos];
      newPhotos[index].active = newPhotos[index].active ? false : true;
      return newPhotos;
    });
  }

  function findTopActivePhoto() {
    let topActivePhoto = 0;
    photos.forEach((photo) => {
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
      const newPhotos = [...oldPhotos];
      newPhotos[result.source.index].index = result.destination.index;
      newPhotos[result.destination.index].index = result.source.index;
      const [removed] = newPhotos.splice(result.source.index, 1);
      newPhotos.splice(result.destination.index, 0, removed);
      return newPhotos;
    });
  }
  return (
    <main className="flex flex-col items-center">
      {/* this is for layered opacity photos. 
      TODO: make the height relative to the image, and then give it a 100px buffer for moving it */}
      <div className="relative h-[600px] w-[400px]">
        {photos.map((photo) => {
          return (
            photo.active && (
              <Draggable1 key={photo.src}>
                <Image
                  className={`absolute top-0 z-[${photo.index}]`}
                  // className={`absolute top-0 opacity-[${photo.opacity}]`}
                  src={photo.src}
                  alt="image"
                  width={400}
                  height={400}
                  draggable={false}
                  style={{ opacity: photo.opacity }}
                />
              </Draggable1>
            )
          );
        })}
      </div>
      <span>{`moving index ${findTopActivePhoto()}`}</span>
      <br></br>
      {/* photos!!!! */}
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
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
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
    </main>
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

// <div /* this is for the 1-4 image previews + opacity sliders */
//   className="mt-4"
// >
//   <DragDropContext onDragEnd={onDragEnd}>
//     <Droppable droppableId="droppable" direction="horizontal">
//       {(provided, snapshot) => (
//         <div
//           ref={provided.innerRef}
//           style={getListStyle(snapshot.isDraggingOver)}
//           {...provided.droppableProps}
//         >
//           {items.items.map((item, index) => (
//             <Draggable key={item.id} draggableId={item.id} index={index}>
//               {(provided, snapshot) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.draggableProps}
//                   {...provided.dragHandleProps}
//                   style={getItemStyle(
//                     snapshot.isDragging,
//                     provided.draggableProps.style
//                   )}
//                 >
//                   {item.content}
//                 </div>
//               )}
//             </Draggable>
//           ))}
//           {provided.placeholder}
//         </div>
//       )}
//     </Droppable>
//   </DragDropContext>
//   {/* hello world */}
// </div>

//   <DragDropContext
//   onDragEnd={(result) => {
//     if (!result.destination) {
//       return;
//     }
//     const newPhotos = reorder(
//       photos,
//       result.source.index,
//       result.destination.index
//     );
//     setPhotos(newPhotos);
//     console.log(result);
//   }}
// >
//   <Droppable droppableId="droppable" direction="horizontal">
//     {(provided, snapshot) => (
//       <div ref={provided.innerRef} {...provided.droppableProps}>
//         {photos.map((photo, index) => {
//           return (
//             <Draggable
//               key={photo.src}
//               draggableId={photo.src}
//               index={index}
//             >
//               {(provided, snapshot) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.draggableProps}
//                   {...provided.dragHandleProps}
//                 >
//                   <div className="flex flex-col">
//                     <Image
//                       src={photo.src}
//                       alt="image"
//                       width={100}
//                       height={100}
//                       draggable={false}
//                     />
//                     <input
//                       type="range"
//                       min="0"
//                       max="1"
//                       step="0.01"
//                       value={photo.opacity}
//                       onChange={(e) => {
//                         setPhotos((p) => {
//                           p[index].opacity = Number(e.target.value);
//                           return p;
//                         });
//                       }}
//                     />
//                   </div>
//                 </div>
//               )}
//             </Draggable>
//           );
//         })}
//         {/* {provided.placeholder} */}
//       </div>
//     )}
//   </Droppable>
// </DragDropContext>

// for use with my own draggable component
// <Draggable
//   initialPos={{ x: 0, y: 0 }}
//   fixOnAxis="y"
//   >
//   <Image src="/images/1.JPG" alt="image" width={400} height={400} />
// </Draggable>

// <div className="flex flex-row">
//   // this is going to be the carousel.
//   {imgPaths.map((image) => {
//     return (
//       <div>
//         {/* <div className="flex flex-col"> */}
//         <Image src={image} alt="image" width={400} height={400} />
//       </div>
//     );
//   })}
// </div>
// export default function Home() {
// return (
//   <main className="flex min-h-screen flex-col items-center justify-between p-24">
//     <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
//       <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
//         Get started by editing&nbsp;
//         <code className="font-mono font-bold">src/app/page.tsx</code>
//       </p>
//       <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
//         <a
//           className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
//           href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           By{' '}
//           <Image
//             src="/vercel.svg"
//             alt="Vercel Logo"
//             className="dark:invert"
//             width={100}
//             height={24}
//             priority
//           />
//         </a>
//       </div>
//     </div>

//     <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
//       <Image
//         className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
//         src="/next.svg"
//         alt="Next.js Logo"
//         width={180}
//         height={37}
//         priority
//       />
//     </div>

//     <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
//       <a
//         href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//         className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         <h2 className={`mb-3 text-2xl font-semibold`}>
//           Docs{' '}
//           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//             -&gt;
//           </span>
//         </h2>
//         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//           Find in-depth information about Next.js features and API.
//         </p>
//       </a>

//       <a
//         href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//         className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         <h2 className={`mb-3 text-2xl font-semibold`}>
//           Learn{' '}
//           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//             -&gt;
//           </span>
//         </h2>
//         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//           Learn about Next.js in an interactive course with&nbsp;quizzes!
//         </p>
//       </a>

//       <a
//         href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//         className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         <h2 className={`mb-3 text-2xl font-semibold`}>
//           Templates{' '}
//           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//             -&gt;
//           </span>
//         </h2>
//         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//           Explore the Next.js 13 playground.
//         </p>
//       </a>

//       <a
//         href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//         className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         <h2 className={`mb-3 text-2xl font-semibold`}>
//           Deploy{' '}
//           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//             -&gt;
//           </span>
//         </h2>
//         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//           Instantly deploy your Next.js site to a shareable URL with Vercel.
//         </p>
//       </a>
//     </div>
//   </main>
// )
// }
