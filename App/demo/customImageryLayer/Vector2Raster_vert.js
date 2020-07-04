export default ` 
uniform float tileRectWest;
uniform float tileRectEast;
uniform float tileRectNorth;
uniform float tileRectSouth;
uniform vec2 resolution;
uniform float lineWidth;
uniform float outlineWidth;
uniform float shadowSize;
uniform float lineScale;
uniform float pointSize;
uniform float renderPass;//0,shadows,1-outline,2-line
 
vec2 lonlat_windowCoordinates(float lon,float lat){
    float x=resolution.x*(lon-tileRectWest)/(tileRectEast-tileRectWest);
    float y=resolution.y*(lat-tileRectSouth)/(tileRectNorth-tileRectSouth);
    return vec2(x,y);
}

vec2 lonlat_windowCoordinates(vec3 p){
    return lonlat_windowCoordinates(p.x,p.y);
}

vec2 lonlat_windowCoordinates(vec2 p){
    return lonlat_windowCoordinates(p.x,p.y);
}

vec2 windowCoordinates_normalize(vec2 pWC){
    vec2 xy=pWC.xy/resolution;
    return xy;
}
 
varying vec2 v_textureCoords;
varying float v_featureId;
varying float v_sideMask;
varying float v_distancePx; 

void main(){
    v_featureId=featureId;
    v_sideMask= sideMask;

    float pxPerDeg=resolution.x/(tileRectEast-tileRectWest);
    v_distancePx=pxPerDeg*distanceToStart;
    
    vec2 pt=lonlat_windowCoordinates(position);
    float linwW= lineWidth*0.5;
    if(renderPass==0.){
        linwW=outlineWidth+shadowSize+lineWidth*0.5;
    }else if(renderPass==1.){
        linwW=outlineWidth+lineWidth*0.5;
    } 
    vec2 posWC=pt+sideMask*bufferDir*linwW*lineScale;
    
    vec2 posNor=windowCoordinates_normalize(posWC);
    v_textureCoords=posNor;
    gl_Position=vec4((v_textureCoords-.5)*2.,0.99,1.);
    gl_PointSize=pointSize*lineScale;
}
`