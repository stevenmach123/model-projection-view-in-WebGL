
//KHANG MACH
//Project 2

import buildingShaderSrc from './building.vert.js';
import flatShaderSrc from './flat.vert.js';
import fragmentShaderSrc from './fragment.glsl.js';
const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;
var gl;

var layers = null



var modelM;
var projM ;
var viewM;


var  rotatex = document.querySelector("#rotatex");
var rotatey = document.querySelector("#rotatey");
var z1 =  document.querySelector("#z1");
var z2 =  document.querySelector("#z2");
var zoom = document.querySelector("#zoom");
var angx =  document.querySelector("#x");
var angy = document.querySelector("#y");
var no =  document.querySelector("#no");
var currZoom = 0;
var currProj = 'perspective';

var go1= document.querySelector("#go1");
var go2 =document.querySelector("#go2");
var go3=document.querySelector("#go3");
var go4 =document.querySelector("#go4");
var go5 = document.querySelector("#go5");
var dop = document.querySelector("#tview");
/*
    Vertex shader with normals
*/
class BuildingProgram {
    constructor() {
        this.vertexShader = createShader(gl, gl.VERTEX_SHADER, buildingShaderSrc);
        this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
        this.program = createProgram(gl, this.vertexShader, this.fragmentShader);

        // TODO: set attrib and uniform locations
    }

    use() {
        gl.useProgram(this.program);
    }
}

/*
    Vertex shader with uniform colors
*/
class FlatProgram {
    constructor() {
        this.vertexShader = createShader(gl, gl.VERTEX_SHADER, flatShaderSrc);
        this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
        this.program = createProgram(gl, this.vertexShader, this.fragmentShader);

        // TODO: set attrib and uniform locations
    }

    use() {
        gl.useProgram(this.program);
    }
}


/*
    Collection of layers
*/
class Layers {
    constructor() {
        this.layers = {};
        this.centroid = [0,0,0];
    }

    addBuildingLayer(name, vertices, indices, normals, color){
        var layer = new BuildingLayer(vertices, indices, normals, color);
        layer.init();
        this.layers[name] = layer;
        this.centroid = this.getCentroid();
    } 

    addLayer(name, vertices, indices, color) {
        var layer = new Layer(vertices, indices, color);
        layer.init();
        this.layers[name] = layer;
        this.centroid = this.getCentroid();
    }

    removeLayer(name) {
        delete this.layers[name];
    }

    draw() {
        for(var layer in this.layers) {
            this.layers[layer].draw(this.centroid);
        }
    }

    
    getCentroid() {
        var sum = [0,0,0];
        var numpts = 0;
        for(var layer in this.layers) {
            numpts += this.layers[layer].vertices.length/3;
            for(var i=0; i<this.layers[layer].vertices.length; i+=3) {
                var x = this.layers[layer].vertices[i];
                var y = this.layers[layer].vertices[i+1];
                var z = this.layers[layer].vertices[i+2];
    
                sum[0]+=x;
                sum[1]+=y;
                sum[2]+=z;
            }
        }
        return [sum[0]/numpts,sum[1]/numpts,sum[2]/numpts];
    }
}


function updateModelMatrix(centroid) {
    var scale = scaleMatrix(0.5, 0.5, 0.5);


    //var rotateX = rotateXMatrix( (93) * Math.PI / 180.0);
    //var rotateX = rotateXMatrix((rotatex.value*0+90) * Math.PI / 180.0)

    var rotateX = rotateXMatrix((90) * Math.PI / 180.0) // adjust angle to 90 

    var rotateY = rotateYMatrix( (-rotatey.value-32) * Math.PI / 180.0);
    //angx.textContent =  rotatex.value;
    //angy.textContent  =rotatey.value;
    
    // Move slightly down
    var position = translateMatrix(centroid[0],centroid[1], centroid[2]); // push camera to the real 3 object centroid origin   

    // Multiply together, make sure and read them in opposite order
    modelM = multiplyArrayOfMatrices([
        position, // step 4
        rotateY,  // step 3
        rotateX,  // step 2
        scale     // step 1
    ]);
    
}


function updateProjectionMatrix() {
    var aspect = window.innerWidth / window.innerHeight;
    var proj =mat4.create();
   // document.querySelector("#z2o").textContent  = z2.value;
 

    var v = (zoom.value)/100 ;


  if(dop.value =="perspec"){
   

  // projM =  mat4.perspective(proj, 40*Math.PI /180, aspect, 10, z2.value)
   projM = perspectiveMatrix(40* Math.PI /180, aspect,1,5000 );  // give standard far value, also push object in -1 to 1.
  }
  else{
   //zoom v scaled with v*const. Also adjust aspect to fit with by scale up 2500 to fit with zoom proportional 
      //  -aspect + v or aspect -v indicate zoom go in oposite direction. But again there many test. Not like i know the function

  //projM=  mat4.ortho(proj,aspect-v*2000,aspect+v*2000, v*2000, -v*2000 ,1, 5000);
  projM = orthographicMatrix(-aspect*2500 + v*3800, aspect*2500 - v*3800, -2500 + v*3800/2, 2500 - v*3800/2, 0,30000);

 // projM = mat4.ortho(proj,-1000*aspect-v*2000, 1000*aspect+v*2000,  v*2000, -v*2000,0, 5000);
  //projM = orthographicMatrix(-aspect-v*2000, aspect+v*2000, 0.1+ v*2000, -0.1-v*2000 ,1, 5000);

  //projM = orthographicMatrix(-aspect, aspect,-1, 1, 0,50000);
  }

  
}

function updateViewMatrix(centroid) {
  

   var zoom_val = (100-parseInt(zoom.value))/100*3000;


  // document.querySelector("#zoomo").textContent  = (zoom_val).toString() ;    
    //var position = translateMatrix(0,100, zoom_val );
  /*
    var g1 = parseInt(go1.value);
    var g2 = parseInt(go2.value);
    var g3 = parseInt(go3.value);
    var g4 = parseInt(go4.value);
    var g5 = parseInt(go5.value);
    <
    document.querySelector("#u1").textContent = g1;
    document.querySelector("#u2").textContent=g2;
    document.querySelector("#u3").textContent=g3; 
    document.querySelector("#u4").textContent = g4;
    document.querySelector("#u5").textContent =g5;   */
   
  // var world = lookAt([g1*200,g1*200,-zoom_val], [g3*200,g4*200,g5*200], [100,g4*400,g5*400]);

 // comment out below test with sliders;
 var camera;
 var position
if(dop.value =="perspec"){

 //var camera = lookAt([g1*200,g2*400,-zoom_val], [g3*200,g4*200,g5*200], [100,g4*400,g5*400]);

 // camera = lookAt([-1*200,10*200,-zoom_val],centroid,[0,1,0]); 
  camera  =  lookAt([4*200,10*400,centroid[2]-5000], centroid, [0,1,0]); //lookAt( [eye1,eye2,z-5000] ), where eye1 and eye2 being test by sliders as you can see g1,g2 gonna intake value of slider
  position =translateMatrix(0,0,-zoom_val+5600); //position of camera
 
  
}else{
   
 //world = lookAt([-g1*300,-g2*300,-zoom_val], [100,g4*200,g5*200], [100,g4*500,g5*500]);
 //world = lookAt([-7*300,10*100,-zoom_val], [100,-1*200,0], [100,-1*500,0]);

  //camera = lookAt([g2*300,g1*300,-1*400],centroid,[0,1,0]);
  camera =lookAt([1*300,1*300,-1*400],centroid,[0,1,0]);
  position =translateMatrix(0,0,-8000); //-8000 just make image appear a lost angle, but certainly not use in zoom ortho


//  world = lookAt([-1*300,10*300,-zoom_val], [10*200,-3*200,3*400], [100,-3*200,3*200]);

 // world = lookAt([-g1*300,-g2*300,-zoom_val], [-g2*200,g4*200,g5*400], [100,g4*200,g5*200]);
    //world= lookAt([10*300,5*300,-zoom_val],[5*200,3*200,0],[100,3*200,0]);
   // world =lookAt([-1*300,-10*300,-zoom_val],[-10*200,2*200,0],[100,2*200,0]);

 //world = lookAt([-6*200,2*200,-zoom_val],[2*100,-3*200,0],[100,-3*200,0]);
}

   


 var world2view = multiplyArrayOfMatrices([
    position
    ,camera
]);
//do look at()


   
    viewM = world2view;

}


function createsShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var info = gl.getShaderInfoLog(shader);
        console.log('Could not compile WebGL program:' + info);
    }

    return shader;
}


function createsProgram(vertexShader, fragmentShader) {
    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var info = gl.getProgramInfoLog(program);
        console.log('Could not compile WebGL program:' + info);
    }

    return program;
}






/*
    Layers without normals (water, parks, surface)
*/
class Layer {
    constructor(vertices, indices, color) {
        this.vertices = vertices;
        this.indices = indices;
        this.color = color;
       
    }
 
    init() {
        // TODO: create program, set vertex and index buffers, vao
        console.log("fdfdf");
        var vertexShader = createsShader(gl.VERTEX_SHADER, flatShaderSrc);
        var fragmentShader = createsShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);
        this.program = createsProgram(vertexShader, fragmentShader);

        var posAttribLoc = gl.getAttribLocation(this.program, "position");
       // var colorAttribLoc = gl.getAttribLocation(program, "color");
   
        this.modelLoc = gl.getUniformLocation(this.program, 'uModel');
        this.projLoc = gl.getUniformLocation(this.program, 'uProj');
        this.viewLoc = gl.getUniformLocation(this.program, 'uView');

        this.coloLoc = gl.getUniformLocation(this.program,'colo');
   
        //var flat = {"positions":this.vertices, "indices":this.indices }
        //var mybuff = createBuffers(posAttribLoc,flat)
        this.vertexBuffer = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(this.vertices));
        this.indexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices));

        //this.vao = gl.createVAO(posAttribLoc, this.vertexBuffer);
        this.vao = createVAO(gl, posAttribLoc,this.vertexBuffer);
    }

    draw(centroid) {
        gl.useProgram(this.program);
      
        gl.uniform4fv(this.coloLoc, new Float32Array(this.color)); 
        
        updateModelMatrix(centroid);
        updateProjectionMatrix();
        updateViewMatrix(centroid) ; 
      
        gl.uniformMatrix4fv(this.modelLoc, false, new Float32Array(modelM));
        gl.uniformMatrix4fv(this.projLoc, false, new Float32Array(projM));
        gl.uniformMatrix4fv(this.viewLoc, false, new Float32Array(viewM));
        gl.bindVertexArray(this.vao); 
        // TODO: use program, update model matrix, view matrix, projection matrix
        // TODO: set uniforms
        // TODO: bind vao, bind index buffer, draw elements
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        //console.log("ind",this.indices.length);
        gl.drawElements(gl.TRIANGLES,this.indices.length, gl.UNSIGNED_INT, 0);
        //need add draw()
        
    }
  
}

/*
    Layer with normals (building)
*/
class BuildingLayer extends Layer {
    constructor(vertices, indices, normals, color) {
        super(vertices, indices, color);
        this.normals = normals;
    }

    init() {
        // TODO: create program, set vertex, normal and index buffers, vao
        
        this.vertexShader = createShader(gl,gl.VERTEX_SHADER, buildingShaderSrc );
        this.fragmentShader = createShader(gl,gl.FRAGMENT_SHADER, fragmentShaderSrc);
        this.program = createProgram(gl,this.vertexShader, this.fragmentShader);
   
        var posAttribLoc = gl.getAttribLocation(this.program, "position");
        var normalAttribLoc = gl.getAttribLocation(this.program,"normal");
    
        this.coloLoc = gl.getUniformLocation(this.program,'colo');
        this.modelLoc = gl.getUniformLocation(this.program, 'uModel');
        this.projLoc = gl.getUniformLocation(this.program, 'uProj');
        this.viewLoc = gl.getUniformLocation(this.program, 'uView');
        this.lightLoc = gl.getUniformLocation(this.program,'light');
      
       
        this.vertexBuffer = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(this.vertices));
        this.normalBuffer = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(this.normals));
        this.indexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices));
      
        this.vao = createVAO(gl, posAttribLoc,this.vertexBuffer, normalAttribLoc , this.normalBuffer,null,null);

    }
 
    draw(centroid) {
        // TODO: use program, update model matrix, view matrix, projection matrix
        // TODO: set uniforms
        // TODO: bind vao, bind index buffer, draw elements
        gl.useProgram(this.program);
        
      
      
        updateModelMatrix(centroid);
        updateProjectionMatrix();
        updateViewMatrix(centroid) ; 
        gl.uniform4fv(this.coloLoc, new Float32Array(this.color)); 
        gl.uniformMatrix4fv(this.modelLoc, false, new Float32Array(modelM));
        gl.uniformMatrix4fv(this.projLoc, false, new Float32Array(projM));
        gl.uniformMatrix4fv(this.viewLoc, false, new Float32Array(viewM));
       
        gl.uniform3fv(this.lightLoc, new Float32Array([1,1,1])); 
       
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES,this.indices.length, gl.UNSIGNED_INT, 0);
    }
}

/*
    Event handlers
*/
window.updateRotate = function() {
    currRotate = parseInt(document.querySelector("#rotate").value);
}

window.updateZoom = function() {
    currZoom = parseFloat(document.querySelector("#zoom").value);
}

window.updateProjection = function() {
    currProj = document.querySelector("#projection").value;
}

/*
    File handler
*/
window.handleFile = function(event) {


    var input = event.target;
    var reader = new FileReader();
    

    reader.onload = function() {
        var c= JSON.parse(reader.result);
        
    
        console.log(c)

        // TODO: parse JSON
        for(var layer in c){
            switch (layer) {
                // TODO: add to layers
               
                case 'buildings':
                    // TODO
                
                    layers.addBuildingLayer(layer,c[layer]["coordinates"],c[layer]["indices"],c[layer]["normals"] ,c[layer]["color"] );
                    break;
                case 'water':
                    // TODO
                  
                    layers.addLayer(layer,c[layer]["coordinates"],c[layer]["indices"] ,c[layer]["color"])
                   
                    break;
                case 'parks':
                    // TODO
                  
                    layers.addLayer(layer,c[layer]["coordinates"],c[layer]["indices"] ,c[layer]["color"])
                   
                    break;
                case 'surface':
                    // TODO
                   
                    layers.addLayer(layer,c[layer]["coordinates"],c[layer]["indices"] ,c[layer]["color"])
                  
                
                    break;
                default:
                    break;
            }
        }
    }
    reader.readAsText(input.files[0]);
}


/*
    Main draw function (should call layers.draw)
*/
function draw() {

    gl.clearColor(190/255, 210/255, 215/255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    layers.draw();

    requestAnimationFrame(draw);

}




/*
    Initialize everything
*/
function initialize() {

    var canvas = document.querySelector("#glcanvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl = canvas.getContext("webgl2");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    layers = new Layers();

    window.requestAnimationFrame(draw);

}


window.onload = initialize;