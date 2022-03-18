export default `#version 300 es

uniform mat4 uModel;
uniform mat4 uProj;
uniform mat4 uView;



uniform vec4 colo;
uniform vec3 light;

in vec3 position;
in vec3 normal;


out vec4 vColor;

void main() {
    // TODO: set color as the dot product between a light direction, and the vertex normal
    // TODO: transform position
   

    vec3 norm = normalize(normal);
    float direction_light  = dot(norm,light);
    vColor  =colo;
    vColor.rgb *=  direction_light;
    

    gl_Position = uProj * uView * uModel * vec4(position, 1);
}
`;