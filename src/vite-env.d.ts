/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Optional live-data endpoint (the S3 matches.json). Falls back to the bundled file. */
  readonly VITE_DATA_URL?: string;
  /** Display name for the first player. Falls back to "Player 1". */
  readonly VITE_PLAYER1_NAME?: string;
  /** Display name for the second player. Falls back to "Player 2". */
  readonly VITE_PLAYER2_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
