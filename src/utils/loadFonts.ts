export const loadFonts = async () => {
  const fonts = [
    new FontFace(
      "Great Vibes",
      "url(/fonts/GreatVibes-Regular.ttf)"
    ),
    new FontFace(
      "Montserrat",
      "url(/fonts/Montserrat-VariableFont_wght.ttf)"
    ),
  ];

  await Promise.all(
    fonts.map(async (font) => {
      await font.load();
      document.fonts.add(font);
    })
  );
};
