#FlowViz: a Visualization Toolkit to Support End-User Programming Languages#

Sonya Alexandrova (sonyaa@cs.uw.edu) and Alex Fiannaca (fiannaca@cs.uw.edu)

FlowViz is a library for creating interactive data flow (flow chart) interfaces.  *FlowViz* is designed to make it easy to
create a system that allows end users to develop flow charts based on a set of constraints over the available types of
nodes. This specifically is targeted at allowing for the development of end-user programming systems in which the 
"programming language" consists of a series of interconnected nodes.

###Using *FlowViz* in an VPL App###

Include *FlowViz* and the common includes into your html file like this:

    <!DOCTYPE html>
    <html>
    <head lang="en">
        <meta charset="UTF-8">
        <title>FlowViz Demo App</title>
    
        <link rel="stylesheet" href="./styles/bootstrap.min.css">
        <link rel="stylesheet" href="./styles/FlowViz.css">
    
        <script src="./lib/common.min.js"></script>
    
        <link href='http://fonts.googleapis.com/css?family=Roboto:500,700,300italic,400' rel='stylesheet' type='text/css'>
    
        <style>
            html, body, .container-full {
                font-family: 'Roboto', sans-serif;
            }
    
            .container-full {
                display: flex;
                flex-direction: row;
                min-height: 100vh;
            }
    
            #LeftSidebar {
                flex: 3;
                background-color: #F1F1F1;
                padding: 10px;
            }
    
            #LeftSidebar h1 {
                margin-top: 10px;
                margin-bottom: 20px;
            }
    
            #InteractiveViz {
                flex: 9;
                padding: 0;
            }
        </style>
    </head>
    <body>
    
        <div class="container-full">
            <div id="LeftSidebar"></div>
            <svg id="InteractiveViz"></svg>
        </div>
    
        <script src="./scripts/FlowViz.min.js"></script>
        <script src="./scripts/app.js"></script>
    
    </body>
    </html>

Note that by including *FlowViz* at the end of the body, you speed up the initial rendering time of your application.

`app.js` should simply call the `FlowViz.App()` and implement any callbacks which you want to listen for:

    var App = new FlowViz.App('config.json', 'svg#InteractiveViz', {
    
        Events: {
            "flowviz-ready": function() {
                // Use FlowViz add-ons...
                this.Controls.Create('div#LeftSidebar');
                this.Legend.Create('div#LeftSidebar');
                this.DataEditor.Create('div#LeftSidebar');
            },
    
            "node-added": function() {
                this.ShowMessage("Node added!");
            }
        }
    
    });

By default, FlowViz does not create a legend, controls, or a data-editor. You can create these either by implementing 
your own versions by making calls to the ConfigParser, GraphManager, etc., or you can use the default add-on
implementations included with FlowViz by calling factory methods like `this.Legend.Create('[legend-selector]');` in the 
`flowviz-ready` callback.

###Guidelines for Authoring FlowViz-Compliant SVG Images###

SVG Images used in FlowViz must conform to several guidelines. First, all SVG images must be wrapped with a single <g>
tag. For example:

    <svg>
        <g>
            ...SVG Content Here...
        </g>
    </svg>

Additionally, offsets sometime added by programs like Inkscape must be removed. This means that the content of the SVG
should have coordinate (0,0) at the upper left corner of the rendered content. The easiest way to do this is to simply
author your SVG images in Adobe Illustrator.

Example of a *good* SVG:

    <?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Addition" 
         xmlns="http://www.w3.org/2000/svg" 
         xmlns:xlink="http://www.w3.org/1999/xlink" 
         x="0px" y="0px"
    	 viewBox="0 0 100 100" enable-background="new 0 0 100 100" 
    	 xml:space="preserve">
    	 
        <g>
            <circle fill="#FFFFFF" stroke="#FFFFFF" stroke-width="5" stroke-miterlimit="10" cx="50" cy="50" r="47"/>
            <circle fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" cx="50" cy="50" r="47"/>
            <rect x="45.5" y="17.5" width="8.9" height="65"/>
            <rect x="17.5" y="45.5" width="65" height="9"/>
        </g>
        
    </svg>
    
Example of a *bad* SVG:

    <?xml version= "1.0 " encoding= "UTF-8 " standalone= "no "?>
    <!-- Created with Inkscape (http://www.inkscape.org/) -->
    <svg id= "svg3852 " xmlns:rdf= "http://www.w3.org/1999/02/22-rdf-syntax-ns# " xmlns= "http://www.w3.org/2000/svg " height= "36.406 " width= "76.781 " version= "1.1 " xmlns:cc= "http://creativecommons.org/ns# " xmlns:dc= "http://purl.org/dc/elements/1.1/ ">
    	<metadata id= "metadata3857 ">
    		<rdf:RDF>
    			<cc:Work rdf:about= " ">
    				<dc:format>image/svg+xml</dc:format>
    				<dc:type rdf:resource= "http://purl.org/dc/dcmitype/StillImage "/>
    				<dc:title/>
    			</cc:Work>
    		</rdf:RDF>
    	</metadata>
    	<g id= "layer1 " transform= "translate(10.0625,17.375) ">
    		<rect id= "rect3759 " height= "22.856 " width= "57.976 " stroke-dasharray= "none " stroke-miterlimit= "4 " y= "11.914 " x= "-8.0673 " stroke-width= "6 " fill= "none "/>
    		<rect id= "rect3761 " height= "6.0147 " width= "14.802 " stroke-dasharray= "none " stroke-miterlimit= "4 " y= "20.335 " x= "25.855 " stroke-width= "6 " fill= "none "/>
    	</g>
    </svg>

This is an example of a bad SVG because it's top level `<g>` tag has a translation on it indicating that it's upper-left
corner is not at (0,0). This is the type of SVG that Inkscape will generate by default.

##Notes for Contributors##
###Repo Structure###

This repository may look complicated at first glance, but don't worry, it is much simpler than it may appear!
All code for the *FlowViz* library is under the `lib/` directory. This library uses node.js syntax (i.e. require keyword)
in order to ensure that the code doesn't all end up in a single file. The FlowViz.js file is the primary source file for
the library. This file is responsible for requiring all of the other modules and hooking them together. All of the real
functionality of the library is broken out into modules in the `lib/modules/` directory. The `app/` directory is a demo
app which can be used for testing the *FlowViz* library. Finally, upon building, a `dist/` directory is created with the 
browserified and minified code. This includes two main files: `common.min.js` containing minified and concatanated 
copies of jQuery and Bootstrap, and `flowviz.min.js` containing the actual *FlowViz* library.

###Installing Dependencies###

You must have Node.JS installed to build and run this project. Run `npm install` to install all of the build 
dependencies for this project. If you are missing any global dependencies you will receive a message explaining how
to install them when you run `gulp`.

###Build the *FlowViz* Library###

Run `gulp` to build the *FlowViz* library. The built library will be output in the `dist/scripts/` folder. Note that 
the `dist/lib/` directory contains common includes which *FlowViz* depends on. Therefore, don't forget to also grab
the `dist/lib/common.min.js` file in addition to the `dist/scripts/flowviz.min.js` file when you go to use *FlowViz* in
a webapp.

###Running the demo application for developing *FlowViz*###

Running the command `gulp serve` will build the *FlowViz* library, save the built library to the `dist/scripts/` 
directory, copy `app/index.html` to the `dist/` directory, and run a web server serving the file `dist/index.html`. 
After running `gulp serve` any changes to module files or files in the `app/` directory will cause a rebuild and 
will reload the app in the browser.