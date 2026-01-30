export const formatearDuracion = (totalSegundos: number) => {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  return {
    minutos,
    segundos,
    texto: `${minutos} min ${segundos} seg`,
  };
};