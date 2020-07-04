
export = geojson;
export as namespace geojson;

declare namespace geojson {
    export interface Shape {
        type: 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon'
        coordinates: number[][] | number[][][] | number[][][][]
        bbox?: number[]
    }

    export interface IPoint {
        type: 'Point' | 'MultiPoint'
        coordinates: number[] | number[][]
    }

    export interface Point extends IPoint {
        type: 'Point'
        coordinates: number[]
    }

    export interface MultiPoint extends IPoint {
        type: 'MultiPoint'
        coordinates: number[][]
        bbox?: number[]
    }

    export interface LineString extends Shape {
        type: 'LineString'
        coordinates: number[][]
    }

    export interface Polygon extends Shape {
        type: 'Polygon'
        coordinates: number[][][]
    }

    export interface MultiLineString {
        type: 'MultiLineString'
        coordinates: number[][][]
    }

    export interface MultiPolygon {
        type: 'MultiPolygon'
        coordinates: number[][][][]
    }

    export interface Feature<T> {
        geometry: T | {
            type: 'MultiGeometry',
            geometry: T[]
        }
        type: 'Feature'
        properties?: {}
    }

    export interface FeatureCollection<T> {
        constructor(options: {
            type: "FeatureCollection"
            features: Feature<T>
            properties?: {}
        })
        type: "FeatureCollection"
        features: Feature<T>[]
        properties?: {}
    }
}