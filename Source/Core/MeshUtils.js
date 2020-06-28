
import MaterialUtils from './MaterialUtils.js';
import GeometryUtils from './GeometryUtils.js';
import Mesh from './Mesh.js';

/**
*
*@constructor
*@memberof Cesium
*/
function MeshUtils() {

}

/**
*
*@param {THREE.Mesh}mesh3js
*@return {Cesium.Mesh}
*/
MeshUtils.fromMesh3js = function (mesh3js) {
    if (!MeshUtils.isMesh3js(mesh3js)) {
        return undefined;
    }
    var geometry = mesh3js.geometry;
    if (GeometryUtils.isGeometry3js(geometry)) {
        geometry = GeometryUtils.fromGeometry3js(geometry);
        //if (mesh3js.material.type === "MeshNormalMaterial" || mesh3js.material.type === "MeshPhongMaterial") {
        //    GeometryUtils.computeVertexNormals(geometry)
        //}
    }
    var material = mesh3js.material;
    if (MaterialUtils.isMaterial3js(material)) {
        material = MaterialUtils.fromMaterial3js(material);
    }
    var mesh = new Mesh({
        geometry: geometry,
        material: material,
        position: mesh3js.position,
        scale: mesh3js.scale
    });
    mesh.quaternion = mesh3js.quaternion;
    return mesh;
}
/**
 *
 *@param {Object}mesh
 *@return {Boolean}
 */
MeshUtils.isMesh3js = function (mesh) {
    return typeof THREE !== 'undefined' && mesh instanceof THREE.Mesh;
}
export default MeshUtils; 