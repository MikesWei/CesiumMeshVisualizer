        precision mediump float;

        uniform sampler2D u_b;  //Divergence  LSH  0
        uniform sampler2D u_x;  //Pressure LSH  1

        uniform vec2 u_textureSize;

        uniform float u_alpha;
        uniform float u_reciprocalBeta;

        void main() {

            vec2 fragCoord = gl_FragCoord.xy;

            vec2 currentState = texture2D(u_b, fragCoord/u_textureSize).xy;

            //implicitly solve diffusion via jacobi iteration

            vec2 n = texture2D(u_x, (fragCoord+vec2(0.0, 1.0))/u_textureSize).xy;
            vec2 s = texture2D(u_x, (fragCoord+vec2(0.0, -1.0))/u_textureSize).xy;
            vec2 e = texture2D(u_x, (fragCoord+vec2(1.0, 0.0))/u_textureSize).xy;
            vec2 w = texture2D(u_x, (fragCoord+vec2(-1.0, 0.0))/u_textureSize).xy;

            vec2 nextState = (n + s + e + w + u_alpha * currentState) * u_reciprocalBeta;
            //  u_reciprocalBeta =1/4    u_alpha = -dx*dx??
            gl_FragColor = vec4(nextState, 0, 0);
        }