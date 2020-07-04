
export default `
varying vec2 textureCoords;
uniform vec4 color;
void main(){
    gl_FragColor= color;//vec4(textureCoords,0.,1.);
}`