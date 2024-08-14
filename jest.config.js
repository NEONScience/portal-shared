const modulesToTransform = [
  'dygraphs',
  '@react-leaflet',
  'react-leaflet',
  'dateformat',
  'remark-gfm',
  'micromark-.+',
  'decode-named-character-reference',
  'character-entities',
  'mdast-.*',
  'escape-string-regexp',
  'unist-util-.*',
  'markdown-.*',
  'ccount',
  'd3-[a-z]+'
].join('|');

const fileTypesToMockTransform = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'eot',
  'otf',
  'webp',
  'svg',
  'ttf',
  'woff',
  'woff2',
  'mp4',
  'webm',
  'wav',
  'mp3',
  'm4a',
  'aac',
  'oga'
].join('|');

module.exports = {
  verbose: true,
  testEnvironment: '<rootDir>/test/jest-environment.js',
  roots: [
    '<rootDir>/src/',
  ],
  moduleNameMapper: {
    '@stomp/stompjs': '<rootDir>/src/__mocks__/fileMock.js',
    '@stomp/rx-stomp': '<rootDir>/src/__mocks__/fileMock.js',
    '(pdfjs-dist/build/pdf.worker.mjs)': '<rootDir>/src/__mocks__/constructorMock.js',
    '\\.(css|less)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(svg)$': '<rootDir>/src/__mocks__/svgMock.js',
    'react-markdown': [
      '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
      '<rootDir>/../node_modules/react-markdown/react-markdown.min.js',
    ],
  },
  transform: {
    '\\.(js|jsx|ts|tsx)$': ["babel-jest", { "configFile": "./test/babel.config.test.json" }],
    ['\\.(' + fileTypesToMockTransform + ')$']: '<rootDir>/src/__mocks__/fileTransformer.js',
  },
  // Transform modules that are in ES6 format.
  transformIgnorePatterns: [
    "node_modules/(?!(" + modulesToTransform + ")/)",
  ],
  globalSetup: '<rootDir>/test/jest-global-setup.js',
  setupFiles: [
    'jest-canvas-mock',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/lib/',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/lib/',
  ],
  collectCoverage: true,
  coverageReporters: [
    'lcov',
    'text',
  ],
  coverageDirectory: 'test-coverage',
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  coveragePathIgnorePatterns: [
    '/lib/',
    '/test/',
    '/node_modules/',
    '/src/lib_components/remoteAssets/',
    '/src/lib_components/types/',
    '/src/lib_components/images/',
    '/src/lib_components/components/SiteMap/svg/',
    'src/sampleData',
    'StyleGuide',
  ],
};
