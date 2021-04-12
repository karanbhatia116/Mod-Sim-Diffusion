# Mod-Sim-Diffusion

### To run the animation

1. Download the code
2. Open the index.html file with Chrome or any other browser of choice.
3. For changing boundary conditions, you'll have to make changes in the code manually. By default for heat diffusion, absorbing boundary is considered. <br>
    3.a Go to the sketch.js file<br>
    3.b Go to the setup function defined in that file.<br>
    3.c Change the line ```grid, next = setAbsorbingBoundary(grid, next, boundaryTemp);``` to any other function. Available functions are ```setPeriodicBoundary(grid,next)``` and ```setReflectiveBoundary(grid,next)```. <br>
4. The animation will be downloaded in ```.webm``` format, which can be opened using most of modern browsers.
