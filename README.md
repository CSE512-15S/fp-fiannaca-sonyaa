#FlowViz: a Visualization Toolkit to Support End-User Programming Languages#

Sonya Alexandrova (sonyaa@cs.uw.edu) and Alex Fiannaca (fiannaca@cs.uw.edu)

FlowViz is a library for creating interactive data flow (flow chart) interfaces.  *FlowViz* is designed to make it easy to
create a system that allows end users to develop flow charts based on a set of constraints over the available types of
nodes. This specifically is targeted at allowing for the development of end-user programming systems in which the 
"programming language" consists of a series of interconnected nodes.

##Notes for Developers##
###Repo Structure###

This repository may look complicated at first glance, but don't worry, it is much simpler than it may appear at first!
All code for the *FlowViz* library is under the `lib/` directory. This library uses node.js syntax (i.e. require keyword)
in order to ensure that the code doesn't all end up in a single file. The flowviz.js file is the primary source file for
the library. This file is responsible for requiring all of the other modules and hooking them together. All of the real
functionality of the library is broken out into modules in the `lib/modules/` directory. The `app/` directory is a demo
app which can be used for testing the *FlowViz* library. Finally, upon building, a `dist/` directory is created with the 
browserified and minified code. This includes two main files: `common.min.js` containing minified and concatanated 
copies of jQuery and Bootstrap, and `flowviz.min.js` containing the actual *FlowViz* library.

###Build the *FlowViz* Library###

Run `gulp` to build the *FlowViz* library. The built library will be output in the `dist/scripts/` folder. Note that 
the `dist/lib/` directory contains common includes which *FlowViz* depends on. Therefore, don't forget to also grab
the `dist/lib/common.min.js` file in addition to the `dist/scripts/flowviz.min.js` file!

###Running the demo application for developing *FlowViz*###

Running the command `gulp serve` will build the *FlowViz* library, save the built library to the `dist/scripts/` 
directory, copy `app/index.html` to the `dist/` directory, and run a web server serving the file `dist/index.html`. 
After running `gulp serve` any changes to module files of index.html will rebuild and reload the app in the browser.

###Use *FlowViz* in an App###

Include *FlowViz* and the common includes into your html file like this:

    <!DOCTYPE html>
    <html>
    <head lang="en">
        <meta charset="UTF-8">
        <title></title>
    
        <script src="./path_to_libraries/common.min.js"></script>
    </head>
    <body>
        <svg id="InteractiveViz"></svg>
    
        <script src="MyCallbacks.js"></script>
        <script src="./path_to_libraries/flowviz.min.js"></script>
        <script>
            // config.json contains the specification for the graphs that can be made with this interface
            // MyCallbacks is a js file defining all of the callbacks specified in config.json
            var fv = new FlowViz('config.json', new MyCallbacks());
            
            // Run FlowViz and tell it what tag to display the viz in using a CSS selector statement
            fv.run('#InteractiveViz');
        </script>
    </body>
    </html>

Note that by including *FlowViz* at the end of the body, you speed up the initial rendering time of your application.
