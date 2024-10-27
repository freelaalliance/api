export function separarDDDTelefone(numeroTelefone: string) {
  const codigoArea = numeroTelefone.substring(0, 2)
  const numero = numeroTelefone.substring(2)

  return { codigoArea, numero }
}
