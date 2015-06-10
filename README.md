#FlowViz: a Visualization Toolkit to Support End-User Programming Languages

Sonya Alexandrova (sonyaa@cs.uw.edu) and Alex Fiannaca (fiannaca@cs.uw.edu)

**Project Website:** [GitHub Pages Site (Contains Library Documentation)](http://cse512-15s.github.io/fp-fiannaca-sonyaa/)

![summary image](https://github.com/CSE512-15S/fp-fiannaca-sonyaa/raw/master/assets/summary.png)

**Abstract:** Developing a flow-based visual programming language (VPL) is a tedious task due to the fact that it requires writing a large amount of code for simply rendering programs to the screen on top of the code for managing the syntax of the language. While a large number of VPL's exist (e.g. [Scratch](https://scratch.mit.edu/)), there are no existing toolkits for the  development of new VPL's; meaning that developers of these languages are re-writing boiler-plate rendering and syntax management code. To address this issue, we present *FlowViz*, a library which supports the development of VPL's by  handling all of the low level visualization and language graph details by default. *FlowViz* handles the internals of  managing the visual language graph, only requiring developers to specify the types of nodes and constraints between nodes  in their VPL. Being targeted at flow-based VPL's, this specifically enables the development of end-user programming  systems in which the "programming language" consists of a series of interconnected nodes.

**Paper:** [download](https://github.com/CSE512-15S/fp-fiannaca-sonyaa/raw/master/final/paper-fiannaca-sonyaa.pdf)

**Poster:** [download](https://github.com/CSE512-15S/fp-fiannaca-sonyaa/raw/master/final/poster-fiannaca-sonyaa.pdf)

**Running Instructions:** To run our examples ([MapAll](http://cse512-15s.github.io/fp-fiannaca-sonyaa/mapall.html), [Calculator](http://cse512-15s.github.io/fp-fiannaca-sonyaa/calculator.html), [RoboFlow](http://cse512-15s.github.io/fp-fiannaca-sonyaa/roboflow.html)) locally, clone the `gh-pages` branch to your local machine, `cd` into the directory for the repository, and run `python -m SimpleHTTPServer 9000`. After this, you  will be able to navigate to `localhost:9000/mapall.html` to view the MapAll example, `localhost:9000/calculator.html` to view the Calculator example, or `localhost:9000/roboflow.html` to view the RoboFlow example. 

**Building from Source:** If you wish to build the library from scratch, see the instructions below in the **[Notes for Contributors](https://github.com/CSE512-15S/fp-fiannaca-sonyaa#notes-for-contributors)** section.

**Statement of Contributions:** Both authors contributed to major aspects of this project. Sonya was responsible for  developing the Constraint Checking module, the Graph Manager module, the Layout module, and the RoboFlow and Calculator  example apps. Alex was responsible for the high-level design of the library, the Config Parser module, the add-on  modules, the Interactions module, the Renderer module, and the MapAll example app. Other portions of the library were  contributed to by both Alex and Sonya. In order to complete this rather large project in the small window of time we had available to us, we followed a very connected development process. We started by discussing high-level design  concepts for the library, subdividing the tasks into modules which we could work on independently, and then using GitHub issues to discuss issues/conflicts in the design as the implementation progressed. We met about every other day on average.

###Demo VPL's

**[MapAll](http://cse512-15s.github.io/fp-fiannaca-sonyaa/mapall.html):** [(HTML)](https://raw.githubusercontent.com/CSE512-15S/fp-fiannaca-sonyaa/master/app/index.html) [(JS)](https://raw.githubusercontent.com/CSE512-15S/fp-fiannaca-sonyaa/master/app/app.js) [(JSON)](https://raw.githubusercontent.com/CSE512-15S/fp-fiannaca-sonyaa/master/app/config.json) This demo shows a language which is used for specifying transformations on input from HID devices to system actions. This demo shows how custom interactions can be added to the default set of interactions.

**[Calculator](http://cse512-15s.github.io/fp-fiannaca-sonyaa/calculator.html):** [(HTML)](https://raw.githubusercontent.com/CSE512-15S/fp-fiannaca-sonyaa/master/app/calculator.html) [(JS)](https://raw.githubusercontent.com/CSE512-15S/fp-fiannaca-sonyaa/master/app/app_calculator.js) [(JSON)](https://raw.githubusercontent.com/CSE512-15S/fp-fiannaca-sonyaa/master/app/config_calculator.json) This  demo is a classic example created in many compiler classes: a simple calculator. This demonstrates how event callbacks can be used to add application specific logic to FlowViz-based VPL editors (the text displayed on nodes changes as node data is updated and the calculation graph is evaluated when the output operator is clicked).

**[RoboFlow](http://cse512-15s.github.io/fp-fiannaca-sonyaa/roboflow.html):** [(HTML)](https://raw.githubusercontent.com/CSE512-15S/fp-fiannaca-sonyaa/master/app/roboflow.html) [(JS)](https://raw.githubusercontent.com/CSE512-15S/fp-fiannaca-sonyaa/master/app/app_roboflow.js) [(JSON)](https://raw.githubusercontent.com/CSE512-15S/fp-fiannaca-sonyaa/master/app/config_roboflow.json) Finally,  this demo shows the benefit of having the auto-suggest feature when there are a broad range of tokens (node types) in a VPL created with FlowViz. Using the auto-suggest feature makes it quick and easy to build out programs to run on a real-world robot.

###Getting the *FlowViz* Library

**Version 0.1.1:** [flowviz.zip](https://github.com/CSE512-15S/fp-fiannaca-sonyaa/raw/master/release/flowviz-0.1.1.zip)

This is a link to the current production build. This zip folder contains the following files which must be included in  order to use FlowViz:

* flowviz.min.js
* common.min.js
* flowviz.css
* bootstrap.min.css

###Using *FlowViz* in a VPL App

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

In order to create your VPL, you need to provide *FlowViz* with a configuration file. See the **[Configuration](https://github.com/CSE512-15S/fp-fiannaca-sonyaa#configuration)** section  below for a complete description of the possible properties in the FlowViz configuration file.

Finally, you need to create an instance of the `FlowViz.App` type. Create `app.js`, which should simply call the `FlowViz.App()` constructor and implement any callbacks which you want to listen for:

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

By default, FlowViz does not create a legend, controls, or a data-editor. You can create these either by implementing  your own versions by making calls to the ConfigParser, GraphManager, etc., or you can use the default add-on implementations included with FlowViz by calling factory methods like `this.Legend.Create('[legend-selector]');` in the `flowviz-ready` callback.

##Configuration

This is a complete description of all of the possible properties which can be set in the configuration file.

###Properties

**name**: (*required*) {string} The name of your VPL app.

**display.messages**: {"default"|"none"} Indicates if the default notification system should be used to display messages to the end user.

**display.scale**: {number} A value between 0.0 and 1.0 that represents a scaling factor that should be applied to all tokens.

**display.arrowHeight**: {number} The pixel height of the arrow tip on edges.

**display.arrowWidth**: {number} The pixel width of the arrow tip on edges.

**display.layout**: {"vertical"|"horizontal"} The direction in which the auto-layout should layout nodes.

**interactions**: This should be an object where each key is a FlowViz interaction (currently: "Node", "Drag", "EdgeRegion", "NewEdge", "CreateEdge") and the values of each should be an array of objects of this form:

    {
      "event": "[some DOM event]",
      "function": "[the name of an event function you implemented in app.js]"
    }

An example *interactions* section could look like this:

    "interactions": {
      "Node": [{
        "event": "click",
        "function": "myCustomClickHandler"
      }]
    }

**edgeData**: This object contains a list of data items that should be attached to all edges of this type.

**types**: This is the most critical section of the configuration file. This section allows you to create a type  hierarchy. *types* is a list of objects containing the following properties:

**types[** *i* **].type**: (*required*) {string} A name for this type. Do not use whitespace!

**types[** *i* **].desc**: {string} A description for this node type.

**types[** *i* **].name**: {string} A human-readable name for this node type. This is defaulted to be the same as the `type` property above.

**types[** *i* **].view**: {URL | Inline SVG} SVG content for displaying a node. See [below](https://github.com/CSE512-15S/fp-fiannaca-sonyaa#guidelines-for-authoring-flowviz-compliant-svg-images)

**types[** *i* **].width**: {number} This is the width of the SVG source without scaling

**types[** *i* **].height**: {number} This is the height of the SVG source without scaling

**types[** *i* **].padding**: {number} This is the amount of padding that should be applied around a point of connection on the node (where an edge connects to the node).

**types[** *i* **].nodeData**: This object contains a list of data items that should be attached to all nodes of this type.

**types[** *i* **].nodeData[** *key* **].desc**: {string} A description of what this data item represents.

**types[** *i* **].nodeData[** *key* **].type**: (*required*) {string} The javascript type for the data item (object, number, etc.)

**types[** *i* **].nodeData[** *key* **].value**: (*required*) {object} Default value for the data item.
 
**types[** *i* **].constraints**: Constraints are the way that you specify which types of nodes are allowed to be  connected to each other. This is a powerful feature that in essence dictates the syntax of your VPL. The *"incoming"*  property refers to all incoming edges, and likewise for the *"outgoing"* property.

**types[** *i* **].constraints[** *"incoming"* **|** *"outgoing"* **].range**: {array} The min and max number of incoming or outgoing edges allowed to nodes of this type.

**types[** *i* **].constraints[** *"incoming"* **|** *"outgoing"* **].types**: {array} List of allowable incoming and outgoing edge types.

**types[** *i* **].subtypes**: {array} A list of more type objects.

###Guidelines for Authoring FlowViz-Compliant SVG Images

SVG Images used in FlowViz must conform to several guidelines. First, all SVG images must be wrapped with a single `<g>` tag. For example:

    <svg>
        <g>
            ...SVG Content Here...
        </g>
    </svg>

Additionally, offsets sometime added by programs like Inkscape must be removed. This means that the content of the SVG should have coordinate (0,0) at the upper left corner of the rendered content. The easiest way to do this is to simply author your SVG images in Adobe Illustrator.

Example of a *good* SVG:

    <?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Addition"           xmlns="http://www.w3.org/2000/svg"           xmlns:xlink="http://www.w3.org/1999/xlink"           x="0px" y="0px"
    	 viewBox="0 0 100 100" enable-background="new 0 0 100 100"      	 xml:space="preserve">
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

This is an example of a bad SVG because it's top level `<g>` tag has a translation on it indicating that it's upper-left corner is not at (0,0). This is the type of SVG that Inkscape will generate by default.

##Notes for Contributors
###Repo Structure

This repository may look complicated at first glance, but don't worry, it is much simpler than it may appear! All code for the *FlowViz* library is under the `lib/` directory. This library uses node.js syntax (i.e. require keyword) in order to ensure that the code doesn't all end up in a single file. The FlowViz.js file is the primary source file for the library. This file is responsible for requiring all of the other modules and hooking them together. All of the real functionality of the library is broken out into modules in the `lib/modules/` directory. The `app/` directory is a demo app which can be used for testing the *FlowViz* library. Finally, upon building, a `dist/` directory is created with the  browserified and minified code. This includes two main files: `common.min.js` containing minified and concatanated  copies of jQuery and Bootstrap, and `flowviz.min.js` containing the actual *FlowViz* library.

###Installing Dependencies

You must have Node.JS installed to build and run this project. Run `npm install` to install all of the build  dependencies for this project. If you are missing any global dependencies you will receive a message explaining how to install them when you run `gulp`.

###Build the *FlowViz* Library

Run `gulp` to build the *FlowViz* library. The built library will be output in the `dist/scripts/` folder. Note that  the `dist/lib/` directory contains common includes which *FlowViz* depends on. Therefore, don't forget to also grab the `dist/lib/common.min.js` file in addition to the `dist/scripts/flowviz.min.js` file when you go to use *FlowViz* in a webapp.

###Running the demo application for developing *FlowViz*

Running the command `gulp serve` will build the *FlowViz* library, save the built library to the `dist/scripts/`  directory, copy `app/index.html` to the `dist/` directory, and run a web server serving the file `dist/index.html`.  After running `gulp serve` any changes to module files or files in the `app/` directory will cause a rebuild and  will reload the app in the browser.
