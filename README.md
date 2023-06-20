# wigglegram creator

This will allow you to quickly and easily create the wiggle photos made with Nimslo and Nishika cameras. Drag and drop your images, align the focal point, crop your image and then click create gif.

## Priority Todo:
- [ ] give better boundary handling during conversion. 
- [ ] Allow cmd+zoom onto the main images
- [ ] Let an image be chosen in the carousel for the moving index
- [ ] give each image a discernable border so it's obvious for the cropbox
- [ ] give output file names fun generated names
- [ ] figure out how to default the cropBox to all the overlapped areas of the photos.
- [ ] figure out how to make area around cropbox opaque and the interior transparent
- [ ] update cropBox to have a drag handler so the photo behind it can be clicked. 

## todo evenutually:
- [ ] Do a browser check to make sure the browser is compatible.
- [ ] remove third party libraries and code all hooks myself.
- [ ] fix the typescript errors
- [ ] add grain to UI to make it look cool [see this video](https://www.youtube.com/watch?v=_ZFghigBmqo)


## Done:

- [x] Write the code to generate the gif
- [x] try to figure out the crop part of ffmpeg.
- [x] Create the 'cropbox' which will be a resizable box that will allow user to crop the gif
- [x] Create the drag and drop ingress point instead of pulling images 1,2,3,4