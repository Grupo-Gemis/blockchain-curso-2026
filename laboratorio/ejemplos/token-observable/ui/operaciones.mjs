import {Contract, ContractFactory, formatEther, formatUnits, parseUnits} from 'ethers'

export const names = ['Ana', 'Bruno', 'Carla']
export const serialize = value => JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item, 2)
export function amount(value) {
  const text = String(value).trim().replace(',', '.')
  if (!/^(0|[1-9]\d*)(\.\d{1,18})?$/.test(text)) throw Error('Ingresá una cantidad sin separadores de miles y con hasta 18 decimales.')
  return parseUnits(text, 18)
}
export function explanation(error, contract) {
  const data = error.data ?? error.info?.error?.data?.data ?? error.info?.error?.data
  try {
    const decoded = contract?.interface.parseError(data)
    if (decoded?.name === 'ERC20InsufficientAllowance') return 'El permiso de ese origen para quien llama no alcanza.'
    if (decoded?.name === 'ERC20InsufficientBalance') return 'El saldo del origen no alcanza.'
    if (decoded?.name === 'ERC20InvalidReceiver') return 'La dirección cero no es un destinatario admitido por TokenAula.'
    if (decoded) return decoded.name
  } catch {}
  return error.shortMessage ?? error.message ?? String(error)
}
export class TokenSession {
  constructor(provider, artifact, onSent = () => {}) {
    this.provider = provider
    this.artifact = artifact
    this.onSent = onSent
    this.records = []
    this.contract = null
  }
  async connect() {
    const network = await this.provider.getNetwork()
    const version = await this.provider.send('web3_clientVersion', [])
    if (network.chainId !== 31337n || !/hardhat|edr/i.test(version)) throw Error('Esta práctica solo opera con su nodo Hardhat local, red 31337.')
    this.signers = await Promise.all(names.map((_, i) => this.provider.getSigner(i)))
    this.addresses = await Promise.all(this.signers.map(s => s.getAddress()))
    this.client = version
    this.genesisHash = (await this.provider.getBlock(0)).hash
    return this.snapshot()
  }
  async snapshot(blockNumber) {
    if (!this.addresses) throw Error('Primero conectá el nodo local.')
    const block = await this.provider.getBlock(blockNumber ?? 'latest')
    if (!block) throw Error('El nodo no devolvió el bloque pedido.')
    const blockTag = block.number
    const accounts = await Promise.all(this.addresses.map(async (address, i) => ({name: names[i], address,
      ethWei: (await this.provider.getBalance(address, blockTag)).toString(),
      eth: formatEther(await this.provider.getBalance(address, blockTag)),
      nonce: await this.provider.getTransactionCount(address, blockTag),
      aulaUnits: this.contract ? (await this.contract.balanceOf(address, {blockTag})).toString() : null})))
    const allowances = this.contract ? await Promise.all(this.addresses.map(owner => Promise.all(this.addresses.map(spender => this.contract.allowance(owner, spender, {blockTag}).then(String))))) : null
    const supply = this.contract ? (await this.contract.totalSupply({blockTag})).toString() : null
    return {block: block.number, blockHash: block.hash, accounts, allowances, totalSupplyUnits: supply,
      totalSupplyAula: supply === null ? null : formatUnits(supply, 18), contract: this.contract?.target ?? null}
  }
  async open(address) {
    const code = await this.provider.getCode(address)
    if (code.toLowerCase() !== this.artifact.deployedBytecode.toLowerCase()) throw Error('Esa dirección no contiene el código de TokenAula de esta práctica.')
    const token = new Contract(address, this.artifact.abi, this.provider)
    if (await token.decimals() !== 18n || await token.totalSupply() !== amount('1000000')) throw Error('La emisión o la escala no corresponden al ejemplo.')
    this.contract = token
    return this.snapshot()
  }
  async create(actor = 0, receiver = 0) {
    const before = await this.snapshot()
    const factory = new ContractFactory(this.artifact.abi, this.artifact.bytecode, this.signers[actor])
    const token = await factory.deploy(this.addresses[receiver])
    const tx = token.deploymentTransaction()
    this.onSent(tx.hash)
    const receipt = await tx.wait()
    this.contract = token.connect(this.provider)
    return this.record('Crear TokenAula', actor, before, receipt, {receiver: this.addresses[receiver]})
  }
  async operation(method, args, actor, options = {}) {
    if (!this.contract) throw Error('Primero creá o abrí una instancia de TokenAula.')
    const before = await this.snapshot()
    const tx = await this.contract.connect(this.signers[actor])[method](...args, options)
    this.onSent(tx.hash)
    let receipt
    try { receipt = await tx.wait() }
    catch (error) {
      receipt = error.receipt
      if (!receipt) throw error
    }
    return this.record(method, actor, before, receipt, {arguments: args})
  }
  transfer(actor, target, value) { return this.operation('transfer', [this.addresses[target], amount(value)], actor) }
  approve(actor, spender, value) { return this.operation('approve', [this.addresses[spender], amount(value)], actor) }
  transferFrom(actor, owner, target, value, includedFailure = false) {
    return this.operation('transferFrom', [this.addresses[owner], this.addresses[target], amount(value)], actor, includedFailure ? {gasLimit: 120000n} : {})
  }
  async simulate(actor, owner, target, value) {
    if (!this.contract) throw Error('Primero creá una instancia.')
    const before = await this.snapshot()
    let accepted = true, message = 'La estimación acepta esta llamada en el estado consultado. Todavía no se envió.'
    try { await this.contract.connect(this.signers[actor]).transferFrom.estimateGas(this.addresses[owner], this.addresses[target], amount(value)) }
    catch (error) { accepted = false; message = explanation(error, this.contract) }
    const entry = {kind: 'simulation', operation: 'Estimar transferFrom', actor: names[actor], accepted, message,
      hash: null, gasUsed: null, feeWei: '0', before, after: await this.snapshot()}
    this.records.push(entry)
    return entry
  }
  async record(operation, actor, before, receipt, details) {
    const block = await this.provider.getBlock(receipt.blockNumber)
    const after = await this.snapshot(receipt.blockNumber)
    const gas = receipt.gasUsed, price = receipt.gasPrice, base = block.baseFeePerGas ?? 0n
    const events = receipt.logs.filter(log => log.address.toLowerCase() === this.contract.target.toLowerCase()).map(log => {
      const event = this.contract.interface.parseLog(log)
      return {name: event.name, arguments: [...event.args].map(String)}
    })
    const entry = JSON.parse(serialize({kind: 'transaction', operation, actor: names[actor], from: receipt.from,
      hash: receipt.hash, block: receipt.blockNumber, blockHash: receipt.blockHash, status: receipt.status,
      contract: this.contract.target, gasUsed: gas, gasPriceWei: price, baseFeeWei: base,
      feeWei: gas * price, burnedWei: gas * base, tipWei: gas * (price - base),
      feeETH: formatEther(gas * price), ethValue: '0', details, events, before, after}))
    if (after.totalSupplyUnits !== amount('1000000').toString()) throw Error('La oferta observada no corresponde al ejemplo de emisión fija.')
    this.records.push(entry)
    return entry
  }
  report() {
    return {format: 'utn-token-observable/v1', createdAt: new Date().toISOString(), chainId: 31337,
      client: this.client, genesisHash: this.genesisHash, contract: this.contract?.target ?? null,
      decimals: 18, participants: names.map((name, i) => ({name, address: this.addresses[i]})), records: this.records,
      scope: 'Un nodo Hardhat local y tres cuentas de desarrollo. No es una red entre pares. No ejecuta el reparto propuesto ni vesting.'}
  }
}
