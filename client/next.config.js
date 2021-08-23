const { EnvironmentPlugin } = require("webpack");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

const { parsed: myEnv } = dotenvExpand(dotenv.config());

if (!myEnv.ENIGMA_CONTRACT_ADDRESS || !myEnv.ENIGMA_ENDPOINT) {
  throw Error("environment variables not setup, please check README");
} else {
  console.log(".env", myEnv);
}

module.exports = withBundleAnalyzer({
  webpack: config => {
    config.plugins.push(new EnvironmentPlugin(myEnv));

    return config;
  }
});
