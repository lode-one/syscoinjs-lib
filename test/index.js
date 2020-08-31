
var sjs = require('..')
var fixtures = require('./fixtures')
var tape = require('tape')
const syscointx = require('syscointx-js')
const bitcoin = sjs.utils.bitcoinjs
const bitcoinops = require('bitcoin-ops')

fixtures.forEach(async function (f) {
  tape(f.description, async function (t) {
    var utxos = f.utxoObj
    var txOpts = f.txOpts
    if (!txOpts) {
      txOpts = { rbf: false }
    }
    // 'null' for no password encryption for local storage and 'true' for testnet
    const HDSigner = new sjs.utils.HDSigner(f.mnemonic, null, true)
    const syscoinjs = new sjs.SyscoinJSLib(HDSigner)
    // example of once you have it signed you can push it to network via backend provider
    // const resSend = await sjs.utils.sendRawTransaction('sys1.bcfn.ca', psbt.extractTransaction().toHex())
    // if(resSend.error) {
    //  console.log('could not send tx! error: ' + resSend.error.message)
    // } else if(resSend.result) {
    //  console.log('tx successfully sent! txid: ' + resSend.result)
    // } else {
    //  console.log('Unrecognized response from backend')
    // }
    //
    if (f.version === syscointx.utils.SYSCOIN_TX_VERSION_SYSCOIN_BURN_TO_ALLOCATION) {
      const psbt = await syscoinjs.syscoinBurnToAssetAllocation(txOpts, f.assetMap, f.sysChangeAddress, f.dataAmount, f.feeRate, f.sysFromXpubOrAddress, utxos)
      t.same(psbt.txOutputs.length, f.expected.numOutputs)
      t.same(psbt.version, f.version)
      psbt.txOutputs.forEach(output => {
        if (output.script) {
          // find opreturn
          const chunks = bitcoin.script.decompile(output.script)
          if (chunks[0] === bitcoinops.OP_RETURN) {
            t.same(output.script, f.expected.script)
            const assetAllocations = syscointx.bufferUtils.deserializeAssetAllocations(chunks[1])
            t.same(assetAllocations, f.expected.asset.allocation)
          }
        }
      })
    } else if (f.version === syscointx.utils.SYSCOIN_TX_VERSION_ASSET_ACTIVATE) {
      const psbt = await syscoinjs.assetNew(f.assetOpts, txOpts, f.sysChangeAddress, f.feeRate, f.sysFromXpubOrAddress, utxos)
      t.same(psbt.txOutputs.length, f.expected.numOutputs)
      t.same(psbt.version, f.version)
      t.same(psbt.extractTransaction().toHex(), f.expected.hex)
      psbt.txOutputs.forEach(output => {
        if (output.script) {
          // find opreturn
          const chunks = bitcoin.script.decompile(output.script)
          if (chunks[0] === bitcoinops.OP_RETURN) {
            t.same(output.script, f.expected.script)
            const asset = syscointx.bufferUtils.deserializeAsset(chunks[1])
            t.same(asset, f.expected.asset)
            t.same(asset.allocation, f.expected.asset.allocation)
          }
        }
      })
    } else if (f.version === syscointx.utils.SYSCOIN_TX_VERSION_ASSET_UPDATE) {
      const psbt = await syscoinjs.assetUpdate(f.assetGuid, f.assetOpts, txOpts, f.assetMap, f.sysChangeAddress, f.feeRate, f.sysFromXpubOrAddress, utxos)
      t.same(psbt.txOutputs.length, f.expected.numOutputs)
      t.same(psbt.version, f.version)
      t.same(psbt.extractTransaction().toHex(), f.expected.hex)
      psbt.txOutputs.forEach(output => {
        if (output.script) {
          // find opreturn
          const chunks = bitcoin.script.decompile(output.script)
          if (chunks[0] === bitcoinops.OP_RETURN) {
            t.same(output.script, f.expected.script)
            const asset = syscointx.bufferUtils.deserializeAsset(chunks[1])
            t.same(asset, f.expected.asset)
            t.same(asset.allocation, f.expected.asset.allocation)
          }
        }
      })
    } else if (f.version === syscointx.utils.SYSCOIN_TX_VERSION_ASSET_SEND) {
      const psbt = await syscoinjs.assetSend(txOpts, f.assetMap, f.sysChangeAddress, f.feeRate, f.sysFromXpubOrAddress, utxos)
      t.same(psbt.txOutputs.length, f.expected.numOutputs)
      t.same(psbt.version, f.version)
      t.same(psbt.extractTransaction().toHex(), f.expected.hex)
      psbt.txOutputs.forEach(output => {
        if (output.script) {
          // find opreturn
          const chunks = bitcoin.script.decompile(output.script)
          if (chunks[0] === bitcoinops.OP_RETURN) {
            t.same(output.script, f.expected.script)
            const assetAllocations = syscointx.bufferUtils.deserializeAssetAllocations(chunks[1])
            t.same(assetAllocations, f.expected.asset.allocation)
          }
        }
      })
    } else if (f.version === syscointx.utils.SYSCOIN_TX_VERSION_ALLOCATION_MINT) {
      const psbt = await syscoinjs.assetAllocationMint(f.assetOpts, txOpts, f.assetMap, f.sysChangeAddress, f.feeRate, f.sysFromXpubOrAddress, utxos)
      t.same(psbt.txOutputs.length, f.expected.numOutputs)
      t.same(psbt.version, f.version)
      t.same(psbt.extractTransaction().toHex(), f.expected.hex)
      psbt.txOutputs.forEach(output => {
        if (output.script) {
          // find opreturn
          const chunks = bitcoin.script.decompile(output.script)
          if (chunks[0] === bitcoinops.OP_RETURN) {
            t.same(output.script, f.expected.script)
            const asset = syscointx.bufferUtils.deserializeMintSyscoin(chunks[1])
            t.same(asset, f.expected.asset)
            t.same(asset.allocation, f.expected.asset.allocation)
          }
        }
      })
    } else if (f.version === syscointx.utils.SYSCOIN_TX_VERSION_ALLOCATION_BURN_TO_ETHEREUM || f.version === syscointx.utils.SYSCOIN_TX_VERSION_ALLOCATION_BURN_TO_SYSCOIN) {
      const psbt = await syscoinjs.assetAllocationBurn(f.assetOpts, txOpts, f.assetMap, f.sysChangeAddress, f.feeRate, f.sysFromXpubOrAddress, utxos)
      t.same(psbt.txOutputs.length, f.expected.numOutputs)
      t.same(psbt.version, f.version)
      t.same(psbt.extractTransaction().toHex(), f.expected.hex)
      psbt.txOutputs.forEach(output => {
        if (output.script) {
          // find opreturn
          const chunks = bitcoin.script.decompile(output.script)
          if (chunks[0] === bitcoinops.OP_RETURN) {
            t.same(output.script, f.expected.script)
            const asset = syscointx.bufferUtils.deserializeAllocationBurnToEthereum(chunks[1])
            t.same(asset, f.expected.asset)
            t.same(asset.allocation, f.expected.asset.allocation)
          }
        }
      })
    } else if (f.version === syscointx.utils.SYSCOIN_TX_VERSION_ALLOCATION_SEND) {
      const psbt = await syscoinjs.assetAllocationSend(txOpts, f.assetMap, f.sysChangeAddress, f.feeRate, f.sysFromXpubOrAddress, utxos)
      t.same(psbt.txOutputs.length, f.expected.numOutputs)
      t.same(psbt.version, f.version)
      t.same(psbt.extractTransaction().toHex(), f.expected.hex)
      psbt.txOutputs.forEach(output => {
        if (output.script) {
          // find opreturn
          const chunks = bitcoin.script.decompile(output.script)
          if (chunks[0] === bitcoinops.OP_RETURN) {
            t.same(output.script, f.expected.script)
            const assetAllocations = syscointx.bufferUtils.deserializeAssetAllocations(chunks[1])
            t.same(assetAllocations, f.expected.asset.allocation)
          }
        }
      })
    } else if (f.version === 2) {
      const psbt = await syscoinjs.createTransaction(txOpts, f.changeAddress, f.outputs, f.feeRate, f.fromXpubOrAddress, utxos)
      t.same(psbt.txOutputs.length, f.expected.numOutputs)
      t.same(psbt.version, f.expected.version)
      t.same(psbt.extractTransaction().toHex(), f.expected.hex)
      psbt.txOutputs.forEach(output => {
        if (output.script) {
          // find opreturn
          const chunks = bitcoin.script.decompile(output.script)
          if (chunks[0] === bitcoinops.OP_RETURN) {
            t.same(output.script, f.expected.script)
            const assetAllocations = syscointx.bufferUtils.deserializeAssetAllocations(chunks[1])
            t.same(assetAllocations, f.expected.asset.allocation)
          }
        }
      })
    }
    t.same(txOpts.rbf, f.expected.rbf)
    t.end()
  })
})
