        precision mediump float;

        uniform sampler2D u_velocity;
        uniform sampler2D u_material;

        uniform vec2 u_textureSize;
        uniform float u_scale;

        uniform float u_dt;

        void main() {

            vec2 fragCoord = gl_FragCoord.xy;

            vec2 currentVelocity = u_scale*texture2D(u_velocity, fragCoord/u_textureSize).xy;

            //implicitly solve advection

            if (length(currentVelocity) == 0.0) {//boundary or no velocity
                gl_FragColor = vec4(texture2D(u_material, fragCoord/u_textureSize).xy, 0, 0);
                return;
            }

            vec2 pxCenter = vec2(0.5, 0.5);
            vec2 pos = fragCoord - pxCenter - u_dt*currentVelocity;

             if (pos.x < 1.0) {
               gl_FragColor = vec4(1.0, 0.5, 0, 0);  //初始速度 lsh
               return;
            }
            if (pos.x >= u_textureSize.x-1.0) {
                gl_FragColor = vec4(0, 0, 0, 0);
                //return;
            }
            if (pos.x >= u_textureSize.x-1.0) pos.x -= u_textureSize.x-1.0;

            //periodic boundary in y
            if (pos.y < 0.0) {
                pos.y += u_textureSize.y-1.0;
            }
            if (pos.y >= u_textureSize.y-1.0) {
                pos.y -= u_textureSize.y-1.0;
            }

            //bilinear interp between nearest cells
            vec2 ceiled = ceil(pos);
            vec2 floored = floor(pos);

            vec2 n = texture2D(u_material, (ceiled+pxCenter)/u_textureSize).xy;//actually ne
            vec2 s = texture2D(u_material, (floored+pxCenter)/u_textureSize).xy;//actually sw
            if (ceiled.x != floored.x){
                vec2 se = texture2D(u_material, (vec2(ceiled.x, floored.y)+pxCenter)/u_textureSize).xy;
                vec2 nw = texture2D(u_material, (vec2(floored.x, ceiled.y)+pxCenter)/u_textureSize).xy;
                n = n*(pos.x-floored.x) + nw*(ceiled.x-pos.x);
                s = se*(pos.x-floored.x) + s*(ceiled.x-pos.x);
            }
            vec2 materialVal = n;
            if (ceiled.y != floored.y){
                materialVal = n*(pos.y-floored.y) + s*(ceiled.y-pos.y);
            }

            gl_FragColor = vec4(materialVal, 0, 0);
        }