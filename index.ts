import { parse } from "https://deno.land/std@0.167.0/flags/mod.ts";
import InputLoop from "https://deno.land/x/input@2.0.3/index.ts";

// @deno-types="https://deno.land/x/chalk_deno@v4.1.1-deno/index.d.ts"
import chalk, { chalkStderr } from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js";
import { template } from "./template.ts";

const exists = async (filename: string): Promise<boolean> => {
  try {
    await Deno.stat(filename);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw error;
    }
  }
};

const getProblemInput = async (event: number, n: number): Promise<void> => {
  const filePath = `ts/${event}/${n}.in`;

  const inputExists = await exists(filePath);

  if (!inputExists || (inputExists && !Deno.readTextFileSync(filePath))) {
    console.log(chalk.yellow(`${filePath} does not exist`));
    const response = await fetch(`https://adventofcode.com/${event}/day/${n}/input`, {
      headers: { Cookie: `session=${session}` },
    });

    if (response.ok) {
      const text = await response.text();

      await Deno.writeTextFile(filePath, text);

      console.log(chalk.green(`Data saved in ${filePath}`));
    } else {
      console.log(chalk.red("Error on fetching input:"), response.status, response.statusText);
    }
  } else {
    console.log(chalkStderr.red(`Input file ${filePath} already exits!`));
  }

  const text = template(n);

  for (const part of ["A", "B"]) {
    const filePath = `ts/${event}/${n}${part}.ts`;
    if (!(await exists(filePath))) {
      await Deno.writeTextFile(filePath, text, { create: true });
      console.log(chalk.green(`Typescript file ${filePath} generated!`));
    } else {
      console.log(chalk.red(`Typescript file ${filePath} already exits!`));
    }
  }
};

const args = parse(Deno.args);

const input = new InputLoop();

let session = localStorage.getItem("session");
if (!session || args.s) {
  console.log("Session cookie not available");
  session = await input.question("Enter the session cookie:");
  localStorage.setItem("session", session);
}

const event = args.y ?? 2022;
const day = args.d;

if (args.i) {
  await getProblemInput(event, day);
}
