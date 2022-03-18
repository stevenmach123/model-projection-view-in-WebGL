export default `#version 300 es

uniform mat4 uModel;
uniform mat4 uProj;
uniform mat4 uView;
uniform vec4 uColor;

uniform vec4 colo;
in vec3 position;

out vec4 vColor;

void main() {
    // TODO: transform position
    gl_Position = uProj * uView * uModel * vec4(position, 1);
    vColor = colo;
}
`;