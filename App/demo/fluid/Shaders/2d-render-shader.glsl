precision mediump float;

uniform sampler2D u_material; //值为0-1的一个灰度映射  存放在  r 通道  lsh
uniform vec2 u_obstaclePosition;
uniform vec2 u_textureSize;
uniform float u_obstacleRad;

void main() {
    vec2 fragCoord = gl_FragCoord.xy;

    vec2 dir = fragCoord - vec2(0.5, 0.5) - u_obstaclePosition;
    float dist = length(dir);
    if (dist < u_obstacleRad){
        gl_FragColor = vec4(0.0, 0, 0.0, 1);  //圆的颜色 lsh
        return;
    }

    float mat1 = texture2D(u_material, fragCoord/u_textureSize).x;
    vec3 color = vec3(0.98, 0.93, 0.84);
    //https://www.shadertoy.com/view/MsS3Wc    hsv
    //vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    vec3 rgb = clamp( abs(mod((mat1*0.9+0.5)*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );//lsh
    // vec3 rgb = mix(vec3(1.0,1.0,1.0),vec3(0.0,0.0,1.0),mat1*color);//lsh
    //vec3 rgb = mat1*color;
    gl_FragColor = vec4(rgb, 1);
}