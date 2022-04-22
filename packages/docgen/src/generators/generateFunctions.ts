import chalk from 'chalk'
import fs from 'fs/promises'
import kebabCase from 'just-kebab-case'
import { snapshot } from 'valtio'

import { appState } from '../state'
import { GeneratorOptions, Signature } from '../types'

export type GenerateFunctionsOptions = GeneratorOptions & {}

/**
 * Generates the documentation for functions from the auto-generated JSON file.
 *
 * @param parsedContent - Content of the auto-generated JSON file.
 * @param outputPath - Path to the output directory.
 * @param options - Additional options.
 * @returns Results of the generation.
 */
export async function generateFunctions(
  parsedContent: Array<Signature>,
  outputPath: string,
  { originalDocument = null }: GeneratorOptions = {}
) {
  const { verbose } = snapshot(appState)
  const { FunctionTemplate } = await import('../templates')
  const functions: Array<{ name: string; content: string }> = parsedContent
    .filter((document) => ['Function', 'Method'].includes(document.kindString))
    .map((props: Signature) => ({
      name: props.name,
      content: FunctionTemplate(props, originalDocument || parsedContent)
    }))

  const results = await Promise.allSettled(
    functions.map(async ({ name, content }) => {
      const fileName = `${kebabCase(name)}.mdx`
      const fileOutput = `${outputPath}/${fileName}`

      // we are creating the folder for functions
      try {
        await fs.mkdir(outputPath)
      } catch {
        // TODO: verbose support
      }

      // we are removing the file if it already exists
      try {
        await fs.rm(fileOutput)
      } catch {
        // TODO: verbose support
      }

      // we are writing the documentation file
      await fs.writeFile(fileOutput, content, 'utf-8')

      return { fileName, fileOutput }
    })
  )

  results.forEach((result) => {
    if (result.status === 'rejected') {
      return console.error(
        chalk.red`🔴 ${result.reason.message}`,
        chalk.gray`\n${result.reason.stack}`
      )
    }

    if (verbose) {
      console.info(
        chalk.green`✅ Generated ${chalk.bold(result.value.fileName)}\n    ${chalk.italic.gray(
          `(Output: ${result.value.fileOutput})`
        )}`
      )
    }
  })

  return results
}

export default generateFunctions
