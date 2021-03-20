const { alice } = require("./scripts/accounts");

module.exports = {
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  contracts_directory: "contracts",
  migrations_directory: "migrations",
  networks: {
    development: {
      host: "http://localhost",
      port: 8732,
      network_id: "*",
      secretKey: alice.sk,
      type: "tezos",
    },
    carthagenet: {
      host: "https://carthagenet.smartpy.io",
      port: 443,
      network_id: "*",
      secretKey: alice.sk,
      type: "tezos",
    },
    edonet: {
      host: "https://edonet.smartpy.io",
      port: 443,
      network_id: "*",
      secretKey: alice.sk,
      type: "tezos",
    },
    mainnet: {
      host: "https://mainnet.smartpy.io",
      port: 443,
      network_id: "*",
      type: "tezos",
    },
    zeronet: {
      host: "https://zeronet.smartpy.io",
      port: 443,
      network_id: "*",
      type: "tezos",
    },
  },
  mocha: {
    before_timeout: 600000,
    timeout: 600000,
  },
};
