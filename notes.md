
inspo for UI:
https://www.youtube.com/watch?v=k0oQr7ZVtBQ
some codepens i found:
https://codepen.io/hlfcoding/pen/oXpWOV
https://codepen.io/hlfcoding/pen/poEWZL

# ffmpeg:
salient commands:
identify *.JPG
mogrify -geometry 640x480^ -gravity center -crop 640x480+0+0 *.JPG 

ffmpeg -framerate 1 -pattern_type glob -i 'cropped/*.JPG' -c:v libx264 -r 30 -pix_fmt yuv420p out.mp4

-start_number 0 -framerate 2 -i file%d.jpg -vf format=yuv420p out.mp4