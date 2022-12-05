import { parse } from "https://deno.land/std@0.167.0/flags/mod.ts";
import { input, confirm } from "https://deno.land/x/inquirer/mod.ts";

// @deno-types="https://deno.land/x/chalk_deno@v4.1.1-deno/index.d.ts"
import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js";
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
    console.log(chalk.red(`Input file ${filePath} already exits!`));
  }

  const text = template(n);

  const codeFilePath = `ts/${event}/${n}.ts`;
  if (!(await exists(codeFilePath))) {
    await Deno.writeTextFile(codeFilePath, text, { create: true });
    console.log(chalk.green(`Typescript file ${codeFilePath} generated!`));
  } else {
    console.log(chalk.red(`Typescript file ${codeFilePath} already exits!`));
  }
};

const args = parse(Deno.args);

let session = localStorage.getItem("session");
if (!session || args.s) {
  console.log("Session cookie not available");
  session = await input({ message: "Enter the session cookie:", default: "" });
  if (session) {
    localStorage.setItem("session", session);
  }
}

let aocFolder = localStorage.getItem("folder");
if (!aocFolder || args.folder) {
  console.log();

  const isCurrentFolder = await confirm({ message: `Is the current folder '${Deno.cwd()}' correct?` });

  console.log("isCurrentFolder", isCurrentFolder);
  if (isCurrentFolder) {
    aocFolder = Deno.cwd();
    localStorage.setItem("folder", aocFolder);
  }
}

const event = args.y ?? 2022;
const day = args.d;

if (args.i && aocFolder && session && day) {
  await getProblemInput(event, day);
}
