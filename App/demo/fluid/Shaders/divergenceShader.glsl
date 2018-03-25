        precision mediump float;

        uniform sampler2D u_velocity;

        uniform vec2 u_textureSize;

        uniform float u_const;

        vec2 repeatBoundary(vec2 coord){
            coord -= vec2(0.5, 0.5);
            if (coord.x < 0.0) coord.x = u_textureSize.x-1.0;
            else if (coord.x >= u_textureSize.x-1.0) coord.x = 0.0;
            if (coord.y < 0.0) coord.y = u_textureSize.y-1.0;
            else if (coord.y >= u_textureSize.y-1.0) coord.y = 0.0;
            coord += vec2(0.5, 0.5);
            return coord;
        }

        void main() {

            vec2 fragCoord = gl_FragCoord.xy;

            //finite difference formulation of divergence

            //periodic boundary

            float n = texture2D(u_velocity, repeatBoundary(fragCoord+vec2(0.0, 1.0))/u_textureSize).y;
            float s = texture2D(u_velocity, repeatBoundary(fragCoord+vec2(0.0, -1.0))/u_textureSize).y;

            float e = texture2D(u_velocity, repeatBoundary(fragCoord+vec2(1.0, 0.0))/u_textureSize).x;
            float w = texture2D(u_velocity, (fragCoord+vec2(-1.0, 0.0))/u_textureSize).x;

            float div = u_const*(e-w + n-s);  // u_const= 2*dx*rho/dt
            gl_FragColor = vec4(div, 0, 0, 0);
        }