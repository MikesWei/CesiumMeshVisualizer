        precision mediump float;

        uniform sampler2D u_velocity;

        uniform vec2 u_textureSize;

        uniform vec2 u_mouseCoord;
        uniform vec2 u_mouseDir;

        uniform float u_reciprocalRadius;

        uniform float u_dt;

        void main() {

            vec2 fragCoord = gl_FragCoord.xy;

            vec2 currentVelocity = texture2D(u_velocity, fragCoord/u_textureSize).xy;

            vec2 pxDist = fragCoord - u_mouseCoord;
            currentVelocity += u_mouseDir*u_dt*exp(-(pxDist.x*pxDist.x+pxDist.y*pxDist.y)*u_reciprocalRadius);

            gl_FragColor = vec4(currentVelocity, 0, 0);
        }