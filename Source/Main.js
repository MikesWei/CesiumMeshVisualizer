
import RendererUtils from './Core/RendererUtils.js';
import Mesh from './Core/Mesh.js';
import MeshMaterial from './Core/MeshMaterial.js';
import ShaderChunk from './Core/Shaders/ShaderChunk.js';
import MeshVisualizer from './Core/MeshVisualizer.js';
import FramebufferTexture from './Core/FramebufferTexture.js';
import GeometryUtils from './Core/GeometryUtils.js';
import LOD from './Core/LOD.js';
import PlaneGeometry from './Core/PlaneGeometry.js';
import Rotation from './Core/Rotation.js';
import ReferenceMesh from './Core/ReferenceMesh.js';
import BasicMeshMaterial from './Core/BasicMeshMaterial.js';
import BasicGeometry from './Core/BasicGeometry.js';
import ShaderLib from './Core/Shaders/ShaderLib.js';
import PlaneBufferGeometry from './Core/PlaneBufferGeometry.js';
import CSG from './Util/CSG.js';
import MeshPhongMaterial from './Core/MeshPhongMaterial.js';
import MaterialUtils from './Core/MaterialUtils.js';
import ShaderUtils from './Core/ShaderUtils.js';
import defineProperty from './Util/defineProperty.js';

// var g = typeof window != 'undefined' ? window : (typeof global != 'undefined' ? global : globalThis);
var CesiumMeshVisualizer = {};
if (typeof Cesium !== 'undefined') {
    //     g.Cesium = {};
    // } else {
    CesiumMeshVisualizer = Cesium;
}

CesiumMeshVisualizer.defineProperty = defineProperty;
CesiumMeshVisualizer.RendererUtils = RendererUtils;
CesiumMeshVisualizer.MaterialUtils = MaterialUtils;
CesiumMeshVisualizer.ShaderUtils = ShaderUtils;
CesiumMeshVisualizer.GeometryUtils = GeometryUtils;

CesiumMeshVisualizer.Mesh = Mesh;
CesiumMeshVisualizer.MeshMaterial = MeshMaterial;
CesiumMeshVisualizer.ShaderChunk = ShaderChunk;
CesiumMeshVisualizer.ShaderLib = ShaderLib;
CesiumMeshVisualizer.MeshVisualizer = MeshVisualizer;
CesiumMeshVisualizer.FramebufferTexture = FramebufferTexture;
CesiumMeshVisualizer.LOD = LOD;
CesiumMeshVisualizer.PlaneGeometry = PlaneGeometry;
CesiumMeshVisualizer.Rotation = Rotation;
CesiumMeshVisualizer.ReferenceMesh = ReferenceMesh;
CesiumMeshVisualizer.BasicMeshMaterial = BasicMeshMaterial;
CesiumMeshVisualizer.BasicGeometry = BasicGeometry;
CesiumMeshVisualizer.PlaneBufferGeometry = PlaneBufferGeometry;
CesiumMeshVisualizer.CSG = CSG;
CesiumMeshVisualizer.MeshPhongMaterial = MeshPhongMaterial;
CesiumMeshVisualizer.MeshVisualizerVERSION = '1.0.1';


export {
    RendererUtils, Mesh, MeshMaterial, ShaderChunk, ShaderLib, MeshVisualizer,
    FramebufferTexture, GeometryUtils, LOD, PlaneGeometry, Rotation, ReferenceMesh,
    BasicMeshMaterial, BasicGeometry, PlaneBufferGeometry, CSG,
    MeshPhongMaterial, MaterialUtils, ShaderUtils,defineProperty
}

export default CesiumMeshVisualizer;
if (typeof module != 'undefined') {
    module.exports = CesiumMeshVisualizer;
}