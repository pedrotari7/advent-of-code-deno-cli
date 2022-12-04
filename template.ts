export const template = (day: number) => `import { timer, getSplittedDataFromFile } from '../utilities.ts';

timer.start();

const data = getSplittedDataFromFile(${day});
console.log(data);

timer.stop();
`;
