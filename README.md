#FlowViz: a Visualization Toolkit to Support End-User Programming Languages#


##Build the FlowViz Library##

Run `gulp` to build the flowviz library and copy it to the `dist` folder.

##Running the demo application for developing FlowViz##

Running the command `gulp serve` will build the FlowViz library, save the built library to the `lib/` directory, 
copy `app/index.html` to the `dist/` directory, and run a web server serving the file `dist/index.html`. After running 
`gulp serve` any changes to module files of index.html will rebuild and reload the browser.

