/**
 * Cesium - https://github.com/CesiumGS/cesium
 *
 * Copyright 2011-2020 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/master/LICENSE.md for full licensing details.
 */

define(['./when-54c2dc71', './Check-6c0211bc', './Math-1124a290', './Cartesian2-6bcefdf0', './Transforms-86b39bb3', './RuntimeError-2109023a', './WebGLConstants-76bb35d1', './ComponentDatatype-a26dd044', './GeometryAttribute-953ee211', './GeometryAttributes-4fcfcf40', './AttributeCompression-ce9e2d64', './GeometryPipeline-0cb73036', './EncodedCartesian3-11790f9c', './IndexDatatype-25023891', './IntersectionTests-aa2e5719', './Plane-8d8aa470', './GeometryOffsetAttribute-d746452d', './VertexFormat-4d8b817a', './EllipseGeometryLibrary-8b7ff974', './GeometryInstance-81304f0f', './EllipseGeometry-dfe258e5'], function (when, Check, _Math, Cartesian2, Transforms, RuntimeError, WebGLConstants, ComponentDatatype, GeometryAttribute, GeometryAttributes, AttributeCompression, GeometryPipeline, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, GeometryOffsetAttribute, VertexFormat, EllipseGeometryLibrary, GeometryInstance, EllipseGeometry) { 'use strict';

  function createEllipseGeometry(ellipseGeometry, offset) {
    if (when.defined(offset)) {
      ellipseGeometry = EllipseGeometry.EllipseGeometry.unpack(ellipseGeometry, offset);
    }
    ellipseGeometry._center = Cartesian2.Cartesian3.clone(ellipseGeometry._center);
    ellipseGeometry._ellipsoid = Cartesian2.Ellipsoid.clone(ellipseGeometry._ellipsoid);
    return EllipseGeometry.EllipseGeometry.createGeometry(ellipseGeometry);
  }

  return createEllipseGeometry;

});
//# sourceMappingURL=createEllipseGeometry.js.map
