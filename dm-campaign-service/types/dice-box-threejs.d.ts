declare module '@3d-dice/dice-box-threejs' {
  const DiceBox: new (selector: string, options?: Record<string, unknown>) => { clear: () => void; [k: string]: unknown };
  export default DiceBox;
}
