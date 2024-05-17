#! /usr/bin/env node
import { Project, SourceFile } from "ts-morph";
import * as fs from "fs";
import * as path from "path";

// Ensure the shebang line is at the top of the file
if (require.main === module) {
	process.argv.splice(1, 0, __filename);
}

// Function to find unused variables in a source file
function findUnusedVariables(sourceFile: SourceFile): string[] {
	const unusedVariables: string[] = [];
	const variableDeclarations = sourceFile.getVariableDeclarations();

	variableDeclarations.forEach((variableDeclaration) => {
		const identifier: any = variableDeclaration.getNameNode();
		const references = identifier.findReferences();
		console.log({ references });
		if (references.length === 0) {
			unusedVariables.push(`- ${identifier.getText()}`);
		}
	});

	return unusedVariables;
}

// Function to process all .ts and .tsx files in a directory
function processDirectory(directoryPath: string): string[] {
	const project = new Project();
	project.addSourceFilesAtPaths(`${directoryPath}/**/*.{ts,tsx}`);
	const unusedVariables: string[] = [];

	project.getSourceFiles().forEach((sourceFile) => {
		const fileUnusedVars = findUnusedVariables(sourceFile);
		if (fileUnusedVars.length <= 1) {
			unusedVariables.push(`File: ${sourceFile.getFilePath()}`);
			unusedVariables.push(...fileUnusedVars);
		}
	});

	return unusedVariables;
}

// Main function to run the script
function main() {
	console.log("process.argv", process.argv);
	console.log(process.argv[process.argv.length - 1]);
	const directoryPath = path.join(
		process.cwd(),
		process.argv[process.argv.length - 1],
	);
	if (!directoryPath) {
		console.error("Please provide a directory path as an argument.");
		process.exit(1);
	}

	console.log("directoryPath", directoryPath);

	if (
		!fs.existsSync(directoryPath) ||
		!fs.lstatSync(directoryPath).isDirectory()
	) {
		console.error("The provided path is not a directory or does not exist.");
		process.exit(1);
	}

	const unusedVariables = processDirectory(directoryPath);

	if (unusedVariables.length > 0) {
		const readmePath = path.join(directoryPath, "README.md");
		const readmeContent = fs.existsSync(readmePath)
			? fs.readFileSync(readmePath, "utf-8")
			: "";
		const newContent =
			readmeContent +
			"\n\n## Unused Variables\n\n" +
			unusedVariables.join("\n");
		fs.writeFileSync(readmePath, newContent);
		console.log("Unused variables have been added to README.md.");
	} else {
		console.log("No unused variables found.");
	}
}

if (require.main === module) {
	main();
}
