'use strict';

const SVGO = require('svgo');

const svgoConfig = {
  cleanupAttrs: true,
  removeDoctype: true,
  removeXMLProcInst: false,
  removeComments: true,
  removeMetadata: false,
  removeTitle: false,
  removeDesc: false,
  removeUselessDefs: true,
  removeXMLNS: false,
  removeEditorsNSData: true,
  removeEmptyAttrs: true,
  removeHiddenElems: false,
  removeEmptyText: true,
  removeEmptyContainers: true,
  removeViewBox: true,
  cleanupEnableBackground: true,
  convertStyleToAttrs: true,
  convertColors: true,
  convertTransform: true,
  removeUnknownsAndDefaults: true,
  removeNonInheritableGroupAttrs: true,
  removeUselessStrokeAndFill: true,
  removeUnusedNS: true,
  cleanupIDs: true,
  cleanupNumericValues: true,
  cleanupListOfValues: true,
  moveElemsAttrsToGroup: true,
  moveGroupAttrsToElems: true,
  collapseGroups: false,
  removeRasterImages: false,
  mergePaths: false,
  convertShapeToPath: false,
  sortAttrs: true,
  removeDimensions: false,
};

const svgo = new SVGO(svgoConfig);

module.exports = svgo;