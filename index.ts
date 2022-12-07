import { parse } from "https://deno.land/std@0.167.0/flags/mod.ts";
import { input, confirm } from "https://deno.land/x/inquirer@v0.0.4/mod.ts";
import { exec, OutputMode } from "https://deno.land/x/exec@0.0.5/mod.ts";

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

  const codeFilePath = `${aocFolder}/ts/${event}/${n}.ts`;
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
  console.log(`AOC folder: ${aocFolder}`);

  if (await confirm({ message: `Is the current folder '${Deno.cwd()}' correct?` })) {
    aocFolder = Deno.cwd();
    localStorage.setItem("folder", aocFolder);
  }
}

const event = args.y ?? 2022;
const day = args._.pop() as number | undefined;

if (args.i && aocFolder && session && day) {
  await getProblemInput(event, day);
} else if (session && day && aocFolder) {
  if (Deno.cwd().includes(aocFolder)) {
    const file = `${aocFolder}/ts/${event}/${day}.ts`;

    const response = await exec(`deno run --allow-read ${file}`, { output: OutputMode.Tee });

    if (response.status.success) {
      console.log(
        response.output
          .replace("p1", chalk.green("p1"))
          .replace("p2", chalk.green("p2"))
          .replace("Elapsed Time:", chalk.yellow("Elapsed Time:"))
      );
    } else {
      console.log(chalk.red(`Error when running '${day}.ts'`));
    }
  }
}
