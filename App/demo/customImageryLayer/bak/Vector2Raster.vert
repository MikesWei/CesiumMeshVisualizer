
uniform float tileRectWest;
uniform float tileRectEast;
uniform float tileRectNorth;
uniform float tileRectSouth;
uniform vec2 resolution;
uniform float lineWidth;
uniform float pointSize;

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

vec2 find_crossPoint(vec2 p1,vec2 p2,vec2 p3,vec2 p4){
    
    float a1=p2.y-p1.y;
    float b1=p1.x-p2.x;
    float c1=p1.x*p2.y-p2.x*p1.y;
    float a2=p4.y-p3.y;
    float b2=p3.x-p4.x;
    float c2=p3.x*p4.y-p4.x*p3.y;
    float det=a1*b2-a2*b1;
    vec2 crossPoint=vec2(0.,0.);
    if(det==0.)return crossPoint;
    
    crossPoint.x=(c1*b2-c2*b1)/det;
    crossPoint.y=(a1*c2-a2*c1)/det;
    
    return crossPoint;
}

vec2 rotate90(vec2 p1,vec2 p2){
    vec2 dir=p1-p2;
    dir=normalize(dir);
    dir=vec2(-dir.y,dir.x);//旋转90度
    return dir;
}

vec2 find_corner_dir(vec2 pt,vec2 prevPt,vec2 nextPt,float lineW){
    
    vec2 dir1=rotate90(prevPt,pt)*lineW;
    vec2 dir2=rotate90(pt,nextPt)*lineW;
    
    vec2 pt1=dir1+pt;
    vec2 pt2=dir2+pt;
    
    vec2 prevPt1=dir1+prevPt;
    vec2 nextPt2=dir2+nextPt;
    
    vec2 crossPt=find_crossPoint(prevPt1,pt1,pt2,nextPt2);
    if(crossPt.x==0.&&crossPt.y==0.){
        vec2 dir=rotate90(prevPt,pt);
        return dir*lineW;
    }
    
    vec2 dir=crossPt-pt;
    return dir;
}

/**
*
* @param {Vector2} pt
* @param {Vector2} prevPt
* @param {Vector2} nextPt
*/
vec2 lineBufferDir(vec2 pt,vec2 prevPt,vec2 nextPt,float lineW){
    vec2 centerDir;
    if(nextPt.x==pt.x&&nextPt.y==pt.y){
        centerDir=rotate90(prevPt,pt)*lineW;
        return centerDir;
    }else if(prevPt.x==pt.x&&prevPt.y==pt.y){
        centerDir=rotate90(nextPt,pt)*lineW;
        return centerDir;
    }else{
        return find_corner_dir(pt,prevPt,nextPt,lineW);
    }
}

varying vec2 textureCoords;
void main(){
    vec2 pt=lonlat_windowCoordinates(position);
    vec2 prevPt=lonlat_windowCoordinates(prevPosition);
    vec2 nextPt=lonlat_windowCoordinates(nextPosition);
    vec2 posWC=lineBufferDir(pt,prevPt,nextPt,lineWidth)*sideMask+pt;
    
    vec2 posNor=windowCoordinates_normalize(posWC);
    textureCoords=posNor;
    gl_Position=vec4((textureCoords-.5)*2.,0.,1.);
    gl_PointSize=pointSize;
}