/**
 * Created by ghassaei on 2/24/16.
 */


function initGPUMath(){

    var glBoilerplate = initBoilerPlate();

    var canvas = document.getElementById("glcanvas");
    var gl = canvas.getContext("webgl", {antialias:false}) || canvas.getContext("experimental-webgl", {antialias:false});
    var ext = gl.getExtension("OES_texture_half_float") || gl.getExtension("EXT_color_buffer_half_float");
    
    function notSupported(){
        var elm = '<div id="coverImg" ' +
          'style="background: url(vortexshedding.gif) no-repeat center center fixed;' +
            '-webkit-background-size: cover;' +
            '-moz-background-size: cover;' +
            '-o-background-size: cover;' +
            'background-size: cover;">'+
          '</div>';
        $(elm).appendTo(body);
        $("#noSupportModal").modal("show");
       console.warn("floating point textures are not supported on your system");
    }


    if (!ext) {
        notSupported();
    }
    gl.disable(gl.DEPTH_TEST);

    var maxTexturesInFragmentShader = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    console.log(maxTexturesInFragmentShader + " textures max");


    function GPUMath(){
        this.reset();
    }

    GPUMath.prototype.createProgram = function(programName, vertexShader, fragmentShader){
        var programs = this.programs;
        var program = programs[programName];
        if (program) {
            console.warn("already a program with the name " + programName);
            return;
        }
        program = glBoilerplate.createProgramFromScripts(gl, vertexShader, fragmentShader);
        gl.useProgram(program);
        glBoilerplate.loadVertexData(gl, program);
        programs[programName] = {
            program: program,
            uniforms: {}
        };
    };

    GPUMath.prototype.initTextureFromData = function(name, width, height, typeName, data, shouldReplace){
        var texture = this.textures[name];
        if (!shouldReplace && texture) {
            console.warn("already a texture with the name " + name);
            return;
        }
        var type;
        if (typeName == "HALF_FLOAT") type = ext.HALF_FLOAT_OES;
        else type = gl[typeName];
        texture = glBoilerplate.makeTexture(gl, width, height, type, null);
        this.textures[name] = texture;
    };



    GPUMath.prototype.initFrameBufferForTexture = function(textureName, shouldReplace){
        if (!shouldReplace) {
            var framebuffer = this.frameBuffers[textureName];
            if (framebuffer) {
                console.warn("framebuffer already exists for texture " + textureName);
                return;
            }
        }
        var texture = this.textures[textureName];
        if (!texture){
            console.warn("texture " + textureName + " does not exist");
            return;
        }

        framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        var check = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(check != gl.FRAMEBUFFER_COMPLETE){
            notSupported();
        }

        this.frameBuffers[textureName] = framebuffer;
    };


    GPUMath.prototype.setUniformForProgram = function(programName, name, val, type){
        if (!this.programs[programName]){
            console.warn("no program with name " + programName);
            return;
        }
        var uniforms = this.programs[programName].uniforms;
        var location = uniforms[name];
        if (!location) {
            location = gl.getUniformLocation(this.programs[programName].program, name);
            uniforms[name] = location;
        }
        if (type == "1f") gl.uniform1f(location, val);
        else if (type == "2f") gl.uniform2f(location, val[0], val[1]);
        else if (type == "3f") gl.uniform3f(location, val[0], val[1], val[2]);
        else if (type == "1i") gl.uniform1i(location, val);
        else {
            console.warn("no uniform for type " + type);
        }
    };

    GPUMath.prototype.setSize = function(width, height){
        gl.viewport(0, 0, width, height);
        // canvas.clientWidth = width;
        // canvas.clientHeight = height;
    };

    GPUMath.prototype.setProgram = function(programName){
        gl.useProgram(this.programs[programName].program);
    };

    GPUMath.prototype.step = function(programName, inputTextures, outputTexture){

        gl.useProgram(this.programs[programName].program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[outputTexture]);
        for (var i=0;i<inputTextures.length;i++){
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[inputTextures[i]]);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);//draw to framebuffer
    };

    GPUMath.prototype.swapTextures = function(texture1Name, texture2Name){
        var temp = this.textures[texture1Name];
        this.textures[texture1Name] = this.textures[texture2Name];
        this.textures[texture2Name] = temp;
        temp = this.frameBuffers[texture1Name];
        this.frameBuffers[texture1Name] = this.frameBuffers[texture2Name];
        this.frameBuffers[texture2Name] = temp;
    };

    GPUMath.prototype.swap3Textures = function(texture1Name, texture2Name, texture3Name){
        var temp = this.textures[texture3Name];
        this.textures[texture3Name] = this.textures[texture2Name];
        this.textures[texture2Name] = this.textures[texture1Name];
        this.textures[texture1Name] = temp;
        temp = this.frameBuffers[texture3Name];
        this.frameBuffers[texture3Name] = this.frameBuffers[texture2Name];
        this.frameBuffers[texture2Name] = this.frameBuffers[texture1Name];
        this.frameBuffers[texture1Name] = temp;
    };

    GPUMath.prototype.readyToRead = function(){
        return gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
    };

    GPUMath.prototype.readPixels = function(xMin, yMin, width, height, array){
        gl.readPixels(xMin, yMin, width, height, gl.RGBA, gl.UNSIGNED_BYTE, array);
    };

    GPUMath.prototype.reset = function(){
        this.programs = {};
        this.frameBuffers = {};
        this.textures = {};
        this.index = 0;
    };

    return new GPUMath;
}