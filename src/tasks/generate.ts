import type { AssetGenerator, AssetGeneratorOptions } from '../asset-generator';
import * as c from '../colors';
import type { Context } from '../ctx';
import type { Assets } from '../definitions';
import type { InputAsset } from '../input-asset';
import type { OutputAsset } from '../output-asset';
import { AndroidAssetGenerator } from '../platforms/android';
import { IosAssetGenerator } from '../platforms/ios';
import { PwaAssetGenerator } from '../platforms/pwa';
import type { Project } from '../project';
import { error, log, logger } from '../util/log';

export async function run(ctx: Context): Promise<OutputAsset[]> {
  try {
    if (!(await ctx.project.assetDirExists())) {
      error(
        `Asset directory not found at ${ctx.project.projectRoot}. Use --assetPath to specify a specific directory containing assets`,
      );
      return [];
    }

    const assets = await ctx.project.loadInputAssets();

    if ([assets.logo, assets.icon, assets.splash, assets.splashDark].every((a) => !a)) {
      error(
        `No assets found in the asset path ${c.ancillary(
          ctx.project.assetDir,
        )}. See https://github.com/ionic-team/capacitor-assets to learn how to use this tool.`,
      );
      return [];
    }

    let platforms = ['ios', 'android', 'pwa'];
    if (ctx.args.ios || ctx.args.android || ctx.args.pwa) {
      platforms = [];
    }

    if (ctx.args.ios) {
      platforms.push('ios');
    }
    if (ctx.args.android) {
      platforms.push('android');
    }
    if (ctx.args.pwa) {
      platforms.push('pwa');
    }

    await verifyPlatformFolders(/* mut */ platforms, ctx.project);

    if (platforms.length > 0) {
      if (!ctx.args.silent) {
        log(`Generating assets for ${platforms.map((p) => c.strong(c.success(p))).join(', ')}`);
      }

      const generators = getGenerators(ctx, platforms);

      const generated = await generateAssets(assets, generators, ctx.project);

      if (!ctx.args.silent) {
        logGenerated(generated);
      }

      /*
      if (!ctx.args.silent && platforms.indexOf('pwa') >= 0 && ctx.args.pwaTags) {
        PwaAssetGenerator.logInstructions(generated);
      }
      */

      return generated;
    } else {
      logger.warn('No platforms found, exiting');
      return [];
    }
  } catch (e) {
    error('Unable to generate assets', (e as Error).message);
    error(e);
  }
  return [];
}

async function verifyPlatformFolders(platforms: string[], project: Project) {
  if (platforms.indexOf('ios') >= 0 && !(await project.iosExists())) {
    platforms.splice(platforms.indexOf('ios'), 1);
    logger.warn(`iOS platform not found at ${project.config.ios?.path || ''}, skipping iOS generation`);
  }
  if (platforms.indexOf('android') >= 0 && !(await project.androidExists())) {
    platforms.splice(platforms.indexOf('android'), 1);
    logger.warn(`Android platform not found at ${project.config.android?.path || ''}, skipping android generation`);
  }
}

async function generateAssets(assets: Assets, generators: AssetGenerator[], project: Project) {
  const generated: OutputAsset[] = [];

  async function generateAndCollect(asset: InputAsset) {
    const output = await Promise.all(generators.map((g) => asset.generate(g, project)));
    generated.push(...(output.flat().filter((f) => !!f) as OutputAsset[]));
  }

  const assetTypes = Object.values(assets).filter((v) => !!v);

  for (const asset of assetTypes) {
    await generateAndCollect(asset);
  }

  return generated;
}

function getGenerators(ctx: Context, platforms: string[]): AssetGenerator[] {
  return platforms.map((p) => {
    if (p === 'ios') {
      return new IosAssetGenerator(ctx.args as AssetGeneratorOptions);
    }
    if (p === 'android') {
      return new AndroidAssetGenerator(ctx.args as AssetGeneratorOptions);
    }
    if (p === 'pwa') {
      return new PwaAssetGenerator(ctx.args as AssetGeneratorOptions);
    }
  }) as AssetGenerator[];
}

// Print out a nice report of the assets generated
// and totals per platform
function logGenerated(generated: OutputAsset[]) {
  const sorted = generated.slice().sort((a, b) => {
    return a.template.platform.localeCompare(b.template.platform);
  });

  for (const g of sorted) {
    Object.keys(g.destFilenames).forEach((name) => {
      const filename = g.getDestFilename(name);
      const outputInfo = g.getOutputInfo(name);
      log(
        `${c.strong(c.success('CREATE'))} ${c.strong(c.extra(g.template.platform))} ${c.weak(g.template.kind)} ${
          filename ?? ''
        }${outputInfo ? ` (${size(outputInfo.size)})` : ''}`,
      );
    });
  }

  log('\n');

  // Aggregate total assets and size per platform
  const totals = sorted.reduce(
    (totals, g) => {
      if (!(g.template.platform in totals)) {
        totals[g.template.platform] = {
          count: 0,
          size: 0,
        };
      }

      const entry = totals[g.template.platform];

      const count = Object.values(g.destFilenames).reduce((v) => v + 1, 0);
      const size = Object.values(g.outputInfoMap).reduce((v, c) => v + c.size, 0);

      totals[g.template.platform] = {
        count: entry.count + count,
        size: entry.size + size,
      };

      return totals;
    },
    {} as {
      [platform: string]: {
        count: number;
        size: number;
      };
    },
  );

  log('Totals:');
  for (const platformName of Object.keys(totals).sort()) {
    const e = totals[platformName];
    log(
      `${c.strong(c.success(platformName))}: ${c.strong(c.extra(e.count))} generated, ${c.strong(size(e.size))} total`,
    );
  }
}

function size(bytes: number) {
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Number((bytes / Math.pow(1024, i)).toFixed(2)) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}
