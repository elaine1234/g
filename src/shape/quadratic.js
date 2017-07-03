const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');
const Arrow = require('./util/arrow');
const QuadraticMath = require('./math/quadratic');

const Quadratic = function(cfg) {
  Quadratic.superclass.constructor.call(this, cfg);
};

Quadratic.ATTRS = {
  p1: null,
  p2: null,
  p3: null,
  lineWidth: 1,
  arrow: false
};

Util.extend(Quadratic, Shape);

Util.augment(Quadratic, {
  canStroke: true,
  type: 'quadratic',
  getDefaultAttrs() {
    return {
      lineWidth: 1,
      arrow: false
    };
  },
  calculateBox() {
    const self = this;
    const attrs = self.__attrs;
    const p1 = attrs.p1;
    const p2 = attrs.p2;
    const p3 = attrs.p3;
    let i;
    let l;

    if (
      Util.isNil(p1) ||
      Util.isNil(p2) ||
      Util.isNil(p3)
    ) {
      return null;
    }
    const halfWidth = attrs.lineWidth / 2;


    const xDims = QuadraticMath.extrema(p1[0], p2[0], p3[0]);
    for (i = 0, l = xDims.length; i < l; i++) {
      xDims[i] = QuadraticMath.at(p1[0], p2[0], p3[0], xDims[i]);
    }
    xDims.push(p1[0], p3[0]);
    const yDims = QuadraticMath.extrema(p1[1], p2[1], p3[1]);
    for (i = 0, l = yDims.length; i < l; i++) {
      yDims[i] = QuadraticMath.at(p1[1], p2[1], p3[1], yDims[i]);
    }
    yDims.push(p1[1], p3[1]);

    return {
      minX: Math.min.apply(Math, xDims) - halfWidth,
      maxX: Math.max.apply(Math, xDims) + halfWidth,
      minY: Math.min.apply(Math, yDims) - halfWidth,
      maxY: Math.max.apply(Math, yDims) + halfWidth
    };
  },
  isPointInPath(x, y) {
    const self = this;
    const attrs = self.__attrs;
    const p1 = attrs.p1;
    const p2 = attrs.p2;
    const p3 = attrs.p3;
    const lineWidth = attrs.lineWidth;

    return Inside.quadraticline(
      p1[0], p1[1],
      p2[0], p2[1],
      p3[0], p3[1],
      lineWidth, x, y
    );
  },
  createPath(context) {
    const self = this;
    const attrs = self.__attrs;
    const p1 = attrs.p1;
    const p2 = attrs.p2;
    const p3 = attrs.p3;
    const lineWidth = attrs.lineWidth;
    const arrow = attrs.arrow;

    if (
      Util.isNil(p1) ||
      Util.isNil(p2) ||
      Util.isNil(p3)
    ) {
      return;
    }
    context = context || self.get('context');
    context.beginPath();
    context.moveTo(p1[0], p1[1]);


    if (arrow) {
      const v = [ p3[0] - p2[0], p3[1] - p2[1] ];
      const end = Arrow.getEndPoint(v, [ p3[0], p3[1] ], lineWidth);
      context.quadraticCurveTo(p2[0], p2[1], end[0], end[1]);
      Arrow.makeArrow(context, v, end, lineWidth);
    } else {
      context.quadraticCurveTo(p2[0], p2[1], p3[0], p3[1]);
    }
  },
  getPoint(t) {
    const attrs = this.__attrs;
    return {
      x: QuadraticMath.at(attrs.p1[0], attrs.p2[0], attrs.p3[0], t),
      y: QuadraticMath.at(attrs.p1[1], attrs.p2[1], attrs.p3[1], t)
    };
  }
});

module.exports = Quadratic;