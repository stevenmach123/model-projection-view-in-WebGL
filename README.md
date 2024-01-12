##  CS425 - Computer Graphics I - model projection view

## Link
  - https://stevenmach123.github.io/model-projection-view-in-WebGL/
## How the program run
  -  First, you need a city.json upload, then perspective of the city  gonna appear. This are free to zoom in/out and rotate 2d surface. 
  -  Then, can change projection to be orthogonal, which re-appear on different view and angle  based on  current change of zoom and rotate slide. 

## Main functionality 
  ### Layers  and BuildingLayers with vertex shaders 
   - In Layers, you want getUniformLocation of "colo" for color, and uModel,uProj, uView for gl_position in vertex shader.
   - Such uModel is how translate object in world space,uView is angle, and position of camera, uProj might determine what projection(map world to camera view ) gonna selected in dropdown.
   - In BuildingLayers, since buildings have light effect with normal up/down based on certain positions . So, we need getAttribLocation for both "position" and "normal”. So, We need ”light” beside  "colo", such light depend on normal position, so [1,1,1]. Pass light in buildingShaderSrc to dot(normal, light)  and mutiply with "colo" to see where color gonna appear or not.  
   - Both need have getAttribLocation of position and getUniformIndices. Believed indices gonna give target location from each index  for buffer position render. 
 ### UpdateModelMatrix and  Layers (+Some effect from updateProjectionMatrix)
   - Important to find where the real coordinate of objects. Since, pass water, park,surface and building gonna accumulatively by getCentroid(), so we want translate our view to same as new coordinate by translateMatrix(centroid[0],centroid[1], centroid[2]) 
   - Also rotateY got modified initial to match with same angle of examples compared to first load angle. Or since, updateProjectionMatrix could potentially change eye direction.
 ### UpdateProjectionMatrix  ( + some effect from updateViewMatrix) 
   -  perspectiveMatrix(40* Math.PI /180, aspect,1,5000 ). Set near =1 to see picture, set far = around 5000 and 10000, can prevent zoom make model lost. where our camera is outside the window, so this updateModelMatrix() with lookAt(eye, centroid, up) can trying to camera angle or rotate/look up/down around the object. 
   -   OrthographicMatrix. We gonna trying compress/ stretch  window in right proportion left, right, top, down to create the zoom effect. This mean it’s pointless to use translateMatrix(0,0,z) since you still in window <br/> <br/>
       - projM = orthographicMatrix(-aspect*2500 + v*3800, aspect*2500 - v*3800, -2500 + v*3800/2, 2500 - v*3800/2, 0,30000);
       -   (-aspect*2500, aspect*2500, -2500, 2500). Not mean I know the formula, but by brute force, this allow color not stretch away from building in initial state, cause window is super big
       -   (v*3800, -v*3800, v*3800/2, v*3800/2) , zoom is big like compare to initial state, 3800/2 prevent model stretch up/down vertical. While v*3800/3 make stretch horizontal in zoom 
 
 ### UpdateViewMatrix 
  - lookAt(eye, centroid,up), say eye=[ex,ey,ez] where estimate 5000 to 10000 is good for ez, while to make view the look example. Modifying ex and ey is super tricky like   OrthographicMatrix.  I have made slider 2 variable g1,g2 and have range between -10 and 10, then I will scale up  when see which g1,g2 give a right direction. 
    - After tests, I have  camera  =  lookAt([4*200,10*400,centroid[2]-5000], centroid, [0,1,0]); which ex and ey is (+), 
  - Similar apply for look up of Orthographic projection. Come up with camera =lookAt([1*300,1*300,-1*400],centroid,[0,1,0]). But seem like orthographic project perceive by some normal or right angle. I couldn’t use ez = 5000, so I need g3 in ez as well.
  -  Finally, we can pass camera and position to multiplyArrayMatrix to have you feel like change your angle look top/around and also distance camera relative to window. 
