
export default `
uniform float lineWidth;
uniform float lineScale;
uniform vec4 lineColor;

uniform bool shadows;
uniform vec4 shadowColor; 
uniform float shadowSize;
 
uniform bool outline;
uniform vec4 outlineColor;
uniform float outlineWidth;

uniform float featureCount;

uniform float renderPass;//0,shadows,1-outline,2-line
  
uniform vec2 lineSymbolSize;
uniform sampler2D lineSymbol;
uniform bool lineSymbolReverse;
uniform bool useLineSymbol;

varying vec2 v_textureCoords;
varying float v_featureId;
varying float v_sideMask; 
varying float v_distancePx; 

void main(){  
    vec4 realColor=lineColor;
    if(renderPass==0.){
        realColor=shadowColor;
    }else if(renderPass==1.){
        realColor=outlineColor;
    }else if(useLineSymbol){
        float percent= lineWidth/lineSymbolSize.y;
        float stepLen=percent*lineSymbolSize.x;
        float distToTexStart=mod(v_distancePx,stepLen)/stepLen;
        vec2 st=vec2(distToTexStart,(v_sideMask+1.)/2.);
        if(lineSymbolReverse){
            st.x=1.-st.x;
        }
        realColor=texture2D(lineSymbol,st);
    }

    //int featureId=int(v_featureId);
    // if(featureId==1){
    //     realColor=vec4(1.,0.,1.,1.);
    // }
    // else if(featureId==2){
    //     realColor=vec4(0.5,0.5,1.,1.);
    // }else{
    //     realColor=color*vec4(float(featureId)/featureCount,0.5,0.5,1.);
    // }

    float distToCenter=abs(v_sideMask);
    float distToBound=1.-distToCenter;  
    float threshold;
    if(renderPass!=2.){
        if(renderPass==0.){//shadows
            threshold=shadowSize/(lineWidth*0.5+shadowSize+outlineWidth); 
            if(distToBound>threshold)discard;
            realColor=vec4(realColor.rgb,0.08+ realColor.a* distToBound);
        } 
        else if(renderPass==1.){//outline
            threshold=outlineWidth/(lineWidth*0.5+outlineWidth);
            if(distToBound>threshold)discard;
        }
    }else{
        // vec4 color2;
        // if(outline){
        //     threshold=outlineWidth/(lineWidth*0.5+outlineWidth);
        //     color2=outlineColor;
        //     realColor=mix(realColor,color2,distToBound);
        //     realColor.a*=distToBound/threshold;
        // }
        // else  if(shadows){
        //     color2=shadowColor;
        //     threshold=shadowSize/(lineWidth*0.5+shadowSize);
        //     realColor=mix(realColor,color2,1.-distToBound);
        //     realColor.a*=distToBound/threshold;
        // }
         
    }
      
    gl_FragColor=realColor;
}`