export function getNumeroPedido() {
  const dataAtual = new Date()
  return Number(
    dataAtual.getDate() +
      dataAtual.getMonth() +
      Math.floor(Math.random() * 1000000),
  )
}
