module.exports = {
  presets: ['@vue/app'],
  sourceType: 'unambiguous',
  plugins: [
    [
      'component',
      {
        libraryName: 'yd-ui',
        style: false,
      },
    ],
  ],
}
