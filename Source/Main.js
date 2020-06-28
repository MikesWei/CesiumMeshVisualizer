
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

var g = typeof window != 'undefined' ? window : (typeof global != 'undefined' ? global : globalThis);
if (typeof Cesium === 'undefined') {
    g.Cesium = {};
}
Cesium.RendererUtils = RendererUtils;
Cesium.Mesh = Mesh;
Cesium.MeshMaterial = MeshMaterial;
Cesium.ShaderChunk = ShaderChunk;
Cesium.ShaderLib = ShaderLib;
Cesium.MeshVisualizer = MeshVisualizer;
Cesium.FramebufferTexture = FramebufferTexture;
Cesium.GeometryUtils = GeometryUtils;
Cesium.LOD = LOD;
Cesium.PlaneGeometry = PlaneGeometry;
Cesium.Rotation = Rotation;
Cesium.ReferenceMesh = ReferenceMesh;
Cesium.BasicMeshMaterial = BasicMeshMaterial;
Cesium.BasicGeometry = BasicGeometry;
Cesium.PlaneBufferGeometry = PlaneBufferGeometry;
Cesium.CSG = CSG;
Cesium.MeshPhongMaterial = MeshPhongMaterial;
Cesium.MaterialUtils = MaterialUtils;
Cesium.ShaderUtils = ShaderUtils;
Cesium.MeshVisualizerVERSION = '1.0.1';
export default Cesium;
if (typeof module != 'undefined') {
    module.exports = Cesium;
}