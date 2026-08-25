const { chunkedStrategy } = require("./chunked.strategy.js");
const { singleStrategy } = require("./single.strategy.js");
const { hybridStrategy } = require("./hybrid.strategy.js");
const { fullcontextStrategy } = require("./fullcontext.strategy.js");

const strategies = {
  chunked: chunkedStrategy,
  single: singleStrategy,
  hybrid: hybridStrategy,
  fullcontext: fullcontextStrategy,
};

const VALID_STRATEGIES = Object.keys(strategies);

function resolveStrategyName(name) {
  return VALID_STRATEGIES.includes(name) ? name : "chunked";
}

async function runRetrieval(name, ctx) {
  const fn = strategies[name];
  return fn(ctx);
}

module.exports = { runRetrieval, resolveStrategyName, VALID_STRATEGIES };
