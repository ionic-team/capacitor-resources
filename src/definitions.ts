import type { InputAsset } from './input-asset';

export interface Assets {
  logo: InputAsset | null;
  logoDark: InputAsset | null;
  icon: InputAsset | null;
  iconForeground: InputAsset | null;
  iconBackground: InputAsset | null;
  splash: InputAsset | null;
  splashDark: InputAsset | null;

  iosIcon?: InputAsset | null;
  iosSplash?: InputAsset | null;
  iosSplashDark?: InputAsset | null;

  androidIcon?: InputAsset | null;
  androidIconForeground?: InputAsset | null;
  androidIconBackground?: InputAsset | null;

  androidSplash?: InputAsset | null;
  androidSplashDark?: InputAsset | null;
  androidNotificationIcon?: InputAsset | null;

  pwaIcon?: InputAsset | null;
  pwaSplash?: InputAsset | null;
  pwaSplashDark?: InputAsset | null;
}

export const enum AssetKind {
  Logo = 'logo',
  LogoDark = 'logo-dark',
  AdaptiveIcon = 'adaptive-icon',
  Icon = 'icon',
  IconForeground = 'icon-foreground',
  IconBackground = 'icon-background',
  NotificationIcon = 'notification-icon',
  Splash = 'splash',
  SplashDark = 'splash-dark',
}

export const enum Platform {
  Any = 'any',
  Ios = 'ios',
  Android = 'android',
  Pwa = 'pwa',
  // Windows = 'windows'
}

export const enum Format {
  Png = 'png',
  Jpeg = 'jpeg',
  Svg = 'svg',
  WebP = 'webp',
  Unknown = 'unknown',
}

export const enum Orientation {
  Default = '',
  Portrait = 'portrait',
  Landscape = 'landscape',
}

export const enum Theme {
  Any = 'any',
  Light = 'light',
  Dark = 'dark',
}

export const enum AndroidDensity {
  Default = '',
  Ldpi = 'ldpi',
  Mdpi = 'mdpi',
  Hdpi = 'hdpi',
  Xhdpi = 'xhdpi',
  Xxhdpi = 'xxhdpi',
  Xxxhdpi = 'xxxhdpi',
  LandLdpi = 'land-ldpi',
  LandMdpi = 'land-mdpi',
  LandHdpi = 'land-hdpi',
  LandXhdpi = 'land-xhdpi',
  LandXxhdpi = 'land-xxhdpi',
  LandXxxhdpi = 'land-xxxhdpi',
  PortLdpi = 'port-ldpi',
  PortMdpi = 'port-mdpi',
  PortHdpi = 'port-hdpi',
  PortXhdpi = 'port-xhdpi',
  PortXxhdpi = 'port-xxhdpi',
  PortXxxhdpi = 'port-xxxhdpi',
  DefaultNight = 'night',
  LdpiNight = 'night-ldpi',
  MdpiNight = 'night-mdpi',
  HdpiNight = 'night-hdpi',
  XhdpiNight = 'night-xhdpi',
  XxhdpiNight = 'night-xxhdpi',
  XxxhdpiNight = 'night-xxxhdpi',
  LandLdpiNight = 'land-night-ldpi',
  LandMdpiNight = 'land-night-mdpi',
  LandHdpiNight = 'land-night-hdpi',
  LandXhdpiNight = 'land-night-xhdpi',
  LandXxhdpiNight = 'land-night-xxhdpi',
  LandXxxhdpiNight = 'land-night-xxxhdpi',
  PortLdpiNight = 'port-night-ldpi',
  PortMdpiNight = 'port-night-mdpi',
  PortHdpiNight = 'port-night-hdpi',
  PortXhdpiNight = 'port-night-xhdpi',
  PortXxhdpiNight = 'port-night-xxhdpi',
  PortXxxhdpiNight = 'port-night-xxxhdpi',
}

export interface OutputAssetTemplate {
  platform: Platform;
  kind: AssetKind;
  format: Format;
  width: number;
  height: number;
  scale?: number;
}

export interface IosOutputAssetTemplate extends OutputAssetTemplate {
  name: string;
  idiom: IosIdiom;
}

// https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/ImageSetType.html#//apple_ref/doc/uid/TP40015170-CH25-SW2
export const enum IosIdiom {
  Universal = 'universal',
  iPhone = 'iphone',
  iPad = 'ipad',
  Watch = 'watch',
  TV = 'tv',
}

export type IosOutputAssetTemplateIcon = IosOutputAssetTemplate;
export interface IosOutputAssetTemplateSplash extends IosOutputAssetTemplate {
  orientation: Orientation;
  theme: Theme;
}
export interface PwaOutputAssetTemplate extends OutputAssetTemplate {
  name: string;
  orientation?: Orientation;
  density?: string;
}

export interface AndroidOutputAssetTemplate extends OutputAssetTemplate {
  density?: AndroidDensity;
}

export interface AndroidNotificationTemplate extends AndroidOutputAssetTemplate {
  kind: AssetKind.NotificationIcon;
  width: number;
  height: number;
}

export interface AndroidOutputAssetTemplateSplash extends OutputAssetTemplate {
  density: AndroidDensity;
  orientation: Orientation;
}

export interface AndroidOutputAssetTemplateAdaptiveIcon extends OutputAssetTemplate {
  density: AndroidDensity;
}

// Shape of the Contents.json file inside of ios app appiconset and imageset folders
export interface IosContents {
  images: {
    filename: string;
    size: string;
    scale: string;
    idiom: string;
  }[];
  info?: {
    version: number;
    author: string;
  };
}
