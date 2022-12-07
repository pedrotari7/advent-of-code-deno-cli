export const template = (day: number) =>
  `import { timer, getSplittedDataFromFile } from '../utilities.ts';

timer.start();

const data = getSplittedDataFromFile(${day});

const p1 = null;

const p2 = null;

console.log('p1', p1);
console.log('p2', p2);

timer.stop();
`;
