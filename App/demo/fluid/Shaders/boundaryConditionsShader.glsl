        precision mediump float;

        uniform sampler2D u_texture;// velocity lsh
        uniform float u_scale;
        uniform vec2 u_textureSize;//[width, height]  200*  

        uniform vec2 u_obstaclePosition;//scaled to texture size
        uniform float u_obstacleRad;

        void main() {
            vec2 fragCoord = gl_FragCoord.xy;  //屏幕大小尺寸

            vec2 dir = fragCoord - 3.0*vec2(0.5, 0.5) - u_obstaclePosition;//not sure where this fac of 3 came from?
            float dist = length(dir);
            // 1、圆内  lsh              
            if (dist < u_obstacleRad){
                gl_FragColor = vec4(0);
                return;
            }
            // 2 、圆周围1像素  lsh   
            if (dist < u_obstacleRad+1.0){
                gl_FragColor = u_scale*texture2D(u_texture, (fragCoord + dir/dist*2.0)/u_textureSize);
                return;
            }
            // 3、圆外 lsh   
            gl_FragColor = texture2D(u_texture, fragCoord/u_textureSize);
        }