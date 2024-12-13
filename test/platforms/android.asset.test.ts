import { copy, pathExists, rmSync as rm } from '@ionic/utils-fs';
import tempy from 'tempy';
import sharp from 'sharp';
import { join } from 'path';

import { Context, loadContext } from '../../src/ctx';
import {
  AndroidOutputAssetTemplate,
  AndroidOutputAssetTemplateAdaptiveIcon,
  Assets,
} from '../../src/definitions';
import { OutputAsset } from '../../src/output-asset';
import { AndroidAssetGenerator } from '../../src/platforms/android';

describe('Android asset test', () => {
  let ctx: Context;
  let assets: Assets;
  const fixtureDir = tempy.directory();

  beforeAll(async () => {
    await copy('test/fixtures/app', fixtureDir);
  });

  beforeEach(async () => {
    ctx = await loadContext(fixtureDir);
    assets = await ctx.project.loadInputAssets();
  });

  afterAll(async () => {
    /*
    console.log(
      'Using text/fixtures/app Wrote to',
      join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
    );
    const files = await readdirp(
      join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
    );
    console.log(
      files
        .filter(f => !statSync(f).isDirectory())
        .map(f =>
          f.replace(
            join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
            '',
          ),
        ),
    );
    // console.log(await readFile(join(fixtureDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'), { encoding: 'utf-8' }));
    */
    await rm(fixtureDir, { force: true, recursive: true });
  });

  async function verifySizes(generatedAssets: OutputAsset<AndroidOutputAssetTemplate>[]) {
    const sizedSet = await Promise.all(
      generatedAssets.map(async (asset) => {
        const dest = Object.values(asset.destFilenames)[0];
        const pipe = sharp(dest);
        const metadata = await pipe.metadata();
        return metadata.width === asset.template.width && metadata.height === asset.template.height;
      }),
    );
    expect(sizedSet.every((e) => !!e)).toBe(true);
  }

  it('Should generate android legacy icons', async () => {
    const assets = await ctx.project.loadInputAssets();

    const strategy = new AndroidAssetGenerator();
    let generatedAssets = ((await assets.icon?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplateAdaptiveIcon>[];

    // Expect legacy main icons and rounded to be generated
    expect(generatedAssets.length).toBe(12);

    const template = generatedAssets[0].template;

    Object.values(generatedAssets[0].destFilenames).map(async (f) => expect(await pathExists(f)).toBe(true));

    await verifySizes(generatedAssets);
  });

  it('Should generate android adaptive icons', async () => {
    const assets = await ctx.project.loadInputAssets();

    const strategy = new AndroidAssetGenerator();
    let generatedAssets = ((await assets.iconForeground?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplateAdaptiveIcon>[];

    expect(generatedAssets.length).toBe(6);

    Object.values(generatedAssets[0].destFilenames).map(async (f) => expect(await pathExists(f)).toBe(true));

    generatedAssets = ((await assets.iconBackground?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplateAdaptiveIcon>[];

    expect(generatedAssets.length).toBe(6);

    Object.values(generatedAssets[0].destFilenames).map(async (f) => expect(await pathExists(f)).toBe(true));

    await verifySizes(generatedAssets);
  });

  it('Should generate android splashes', async () => {
    const assets = await ctx.project.loadInputAssets();

    const strategy = new AndroidAssetGenerator();
    let generatedAssets = (await assets.splash?.generate(strategy, ctx.project)) ?? [];

    expect(generatedAssets.length).toBe(13);

    generatedAssets = (await assets.splashDark?.generate(strategy, ctx.project)) ?? [];

    expect(generatedAssets.length).toBe(13);
    await verifySizes(generatedAssets as OutputAsset<AndroidOutputAssetTemplate>[]);
  });
});

describe('Android Asset Test - Logo Only', () => {
  let ctx: Context;
  let assets: Assets;
  const fixtureDir = tempy.directory();

  beforeAll(async () => {
    await copy('test/fixtures/app-logo-only', fixtureDir);
  });

  beforeEach(async () => {
    ctx = await loadContext(fixtureDir);
    assets = await ctx.project.loadInputAssets();
  });

  async function verifySizes(generatedAssets: OutputAsset<AndroidOutputAssetTemplate>[]) {
    const sizedSet = await Promise.all(
      generatedAssets.map(async (asset) => {
        const dest = Object.values(asset.destFilenames)[0];
        const pipe = sharp(dest);
        const metadata = await pipe.metadata();
        return metadata.width === asset.template.width && metadata.height === asset.template.height;
      }),
    );
    expect(sizedSet.every((e) => !!e)).toBe(true);
  }

  afterAll(async () => {
    /*
    console.log(
      'Wrote to',
      join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
    );
    const files = await readdirp(
      join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
    );
    console.log(
      files
        .filter(f => !statSync(f).isDirectory())
        .map(f =>
          f.replace(
            join(fixtureDir, 'android', 'app', 'src', 'main', 'res'),
            '',
          ),
        ),
    );
    */
    // console.log(await readFile(join(fixtureDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'), { encoding: 'utf-8' }));
    await rm(fixtureDir, { force: true, recursive: true });
  });

  it('Should generate icons and splashes from logo', async () => {
    const strategy = new AndroidAssetGenerator({
      splashBackgroundColor: '#999999',
      splashBackgroundColorDark: '#122140',
    });
    let generatedAssets = ((await assets.logo?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplate>[];

    expect(generatedAssets.length).toBe(50);
    await verifySizes(generatedAssets);
  });

  it('Should generate icons and splashes from logo-dark', async () => {
    const strategy = new AndroidAssetGenerator({
      splashBackgroundColor: '#999999',
      splashBackgroundColorDark: '#122140',
    });
    let generatedAssets = ((await assets.logoDark?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplate>[];

    expect(generatedAssets.length).toBe(25);
    await verifySizes(generatedAssets);
  });

  it('Should generate icons in the given flavor folder', async () => {
    const strategy = new AndroidAssetGenerator({
      androidFlavor: 'demo',
    });
    let generatedAssets = ((await assets.logo?.generate(strategy, ctx.project)) ??
      []) as OutputAsset<AndroidOutputAssetTemplate>[];

    generatedAssets.forEach((asset) => {
      Object.keys(asset.destFilenames).forEach(async (name) => {
        let filename = asset.getDestFilename(name);

        expect(filename).toEqual(expect.stringContaining(join('app', 'src', 'demo', 'res')));
        expect(await pathExists(filename)).toBe(true);
      });
    });
  });
});
