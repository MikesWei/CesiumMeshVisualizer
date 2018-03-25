        precision mediump float;

        uniform sampler2D u_velocity;
        uniform sampler2D u_material; //0-1的一个灰度映射  存放在  r 通道  lsh

        uniform vec2 u_textureSize;
        uniform float u_scale;

        uniform float u_dt;

        vec2 bilinearInterp(vec2 pos, sampler2D texture, vec2 size){
            //bilinear interp between nearest cells

            vec2 pxCenter = vec2(0.5, 0.5);

            vec2 ceiled = ceil(pos);
            vec2 floored = floor(pos);

            vec2 n = texture2D(texture, (ceiled+pxCenter)/size).xy;//actually ne
            vec2 s = texture2D(texture, (floored+pxCenter)/size).xy;//actually sw
            if (ceiled.x != floored.x){
                vec2 se = texture2D(texture, (vec2(ceiled.x, floored.y)+pxCenter)/size).xy;
                vec2 nw = texture2D(texture, (vec2(floored.x, ceiled.y)+pxCenter)/size).xy;
                n = n*(pos.x-floored.x) + nw*(ceiled.x-pos.x);
                s = se*(pos.x-floored.x) + s*(ceiled.x-pos.x);
            }
            vec2 materialVal = n;
            if (ceiled.y != floored.y){
                materialVal = n*(pos.y-floored.y) + s*(ceiled.y-pos.y);
            }
            return materialVal;
        }

        void main() {

            vec2 fragCoord = gl_FragCoord.xy;

            vec2 pxCenter = vec2(0.5, 0.5);

            //bilinear interp
            //vec2 currentVelocity = 1.0/u_scale*texture2D(u_velocity, fragCoord/u_textureSize).xy;
            vec2 currentVelocity = 1.0/u_scale*bilinearInterp((fragCoord-pxCenter)*u_scale + pxCenter, u_velocity, u_textureSize*u_scale);

            //implicitly solve advection

            if (fragCoord.x < 1.0){//boundary
                float numCols = floor(u_textureSize.y/10.0);
                if (mod(numCols, 2.0) == 1.0) numCols--;
                float numPx = u_textureSize.y/numCols;
                //初始颜色  黑白相间  lsh
                if (floor(mod((fragCoord.y-2.0)/numPx, 2.0)) == 0.0) gl_FragColor = vec4(1, 0, 0, 0);
                else gl_FragColor = vec4(0, 0, 0, 0);
                return;
            }
            if (length(currentVelocity) == 0.0) {//no velocity
                gl_FragColor = vec4(texture2D(u_material, fragCoord/u_textureSize).xy, 0, 0);
                return;
            }

            vec2 pos = fragCoord - pxCenter - u_dt*currentVelocity;

            if (pos.x >= u_textureSize.x-1.0) {
                gl_FragColor = vec4(0, 0, 0, 0);
                return;
            }

            //periodic boundary in y
            if (pos.y < 0.0) pos.y += u_textureSize.y-1.0;
            if (pos.y >= u_textureSize.y-1.0) pos.y -= u_textureSize.y-1.0;

            gl_FragColor = vec4(bilinearInterp(pos, u_material, u_textureSize), 0, 0);
        }