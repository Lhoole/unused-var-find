import { Project } from 'ts-morph';
import * as path from 'path';

async function findUnusedVariables() {
  // Create a new TypeScript project
  const project = new Project();

  // Load all TypeScript files in the 'src' directory
  const sourceFiles = project.addSourceFilesAtPaths('src/**/*.{ts,js,tsx}');

  // Object to store variable declarations
  const variableDeclarations: { [key: string]: { used: boolean, filePath: string } } = {};

  // Iterate over each source file
  sourceFiles.forEach(sourceFile => {
    const filePath = sourceFile.getFilePath();
    const relativeFilePath = path.relative(process.cwd(), filePath);

    // Traverse the AST of the source file
    sourceFile.forEachDescendant(node => {
      // Check if the node is a variable declaration
      if (node.getKindName() === 'VariableDeclaration') {
        // Get the name of the variable
        const variableName = node.getFirstChild()?.getText();

        if (variableName) {
          // Mark the variable as declared
          variableDeclarations[variableName] = { used: false, filePath: `./${relativeFilePath}` };
        }
      }

      // Check if the node is an identifier (variable usage)
      if (node.getKindName() === 'Identifier') {
        // Get the name of the identifier
        const identifierName = node.getText();

        // Check if the identifier corresponds to a variable declaration
        if (variableDeclarations.hasOwnProperty(identifierName)) {
          // Mark the variable as used
          variableDeclarations[identifierName].used;
        }
      }
    });
  });

  // Generate Markdown report with unused variables
  const unusedVariables = Object.entries(variableDeclarations)
    .filter(([_, { used }]) => !used) // Filter only unused variables
    .map(([variable, { filePath }]) => `- [\`${variable}\`](${filePath})`) // Use backticks to format variable names
    .join('\n');

  // If there are no unused variables, provide a message indicating so
  const markdownContent = unusedVariables || 'No unused variables found';

  // Write the report to a file
  await writeFile('unused_variables.md', markdownContent);
}

async function writeFile(filePath: string, content: string) {
  const fs = require('fs').promises;
  await fs.writeFile(filePath, content, 'utf-8');
}

// Run the function to find unused variables
findUnusedVariables()
  .then(() => console.log('Unused variables report generated successfully.'))
  .catch(error => console.error('Error generating unused variables report:', error));
